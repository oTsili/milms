import mongoose from 'mongoose';
var logger = require('winston');

import { catchAsync } from '@otmilms/common';
import { natsWrapper } from './nats-wrapper';
import { riakWrapper } from './riak-wrapper';
import {
  UserSignUpListener,
  UserSignInListener,
  UserSignOutListener,
  UserUpdateListener,
} from './controllers/events/listeners/user-listener';
import { app } from './app';

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  level: 'info',
  // level: 'debug',
  colorize: true,
  timestamp: true,
});

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.QUERY_RIAK_URI) {
    throw new Error('RIAK_QUERY_RIAK_URI must be defined');
  }
  if (!process.env.WRITE_RIAK_URI) {
    throw new Error('WRITE_RIAK_URI must be defined');
  }

  // connect to RIAK query storage singleton in a mongoose style connection
  await riakWrapper.connectQueryNode([process.env.QUERY_RIAK_URI]);

  // connect to RIAK write storage singleton in a mongoose style connection
  await riakWrapper.connectWriteNode([process.env.WRITE_RIAK_URI]);

  // connect to NATS singleton in a mongoose style
  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
  );

  // gracefull NATS shutdown on interupt or terminate signals
  natsWrapper.client.on('close', () => {
    logger.info('NATS connection closed');
    process.exit();
  });

  // on interupt signal gracefull shutdown nats and riak
  process.on('SIGINT', () => {
    natsWrapper.client.close();
    riakWrapper.queryClient.stop(function () {
      logger.info('RIAK query-client is stopped');
      process.exit();
    });
    // riakWrapper.writeClient.stop(function () {
    //   logger.info('RIAK write-client is stopped');
    //   process.exit();
    // });
  });

  // on terminate signal gracefull shutdown nats and riak
  process.on('SIGTERM', () => {
    natsWrapper.client.close();
    riakWrapper.queryClient.stop(function () {
      logger.info('RIAK query-client is stopped');
      process.exit();
    });
    // riakWrapper.writeClient.stop(function () {
    //   logger.info('RIAK write-client is stopped');
    //   process.exit();
    // });
  });

  // intitialize an event listener for every new user signup
  new UserSignUpListener(natsWrapper.client).listen();

  // intitialize an event listener for every new user signin
  new UserSignInListener(natsWrapper.client).listen();

  // intitialize an event listener for every new user signout
  new UserSignOutListener(natsWrapper.client).listen();

  // intitialize an event listener for every new user update
  new UserUpdateListener(natsWrapper.client).listen();

  // connet to mongoose/MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  logger.info('Connected to MongoDb');

  // initialize express server to listen
  app.listen(process.env.PORT || 3000, () => {
    logger.info(`Listening on port ${process.env.PORT || 3000}!!`);
  });
};

catchAsync(start());
