import mongoose from 'mongoose';
var logger = require('winston');
import { catchAsync } from '@otmilms/common';

import { natsWrapper } from './nats-wrapper';
import { riakWrapper } from './riak-wrapper';
import {
  AssignmentCreateListener,
  AssignmentDeleteListener,
  AssignmentUpdateListener,
} from './controllers/events/listeners/assignment.listener';
import { app } from './app';
import {
  CourseCreateListener,
  CourseDeleteListener,
  CourseUpdateListener,
} from './controllers/events/listeners/course.listener';
import {
  CourseMaterialUpdateListener,
  CourseMaterialCreateListener,
  CourseMaterialDeleteListener,
} from './controllers/events/listeners/course-material.listener';
import {
  AssignmentMaterialCreateListener,
  AssignmentMaterialDeleteListener,
  AssignmentMaterialUpdateListener,
} from './controllers/events/listeners/assignment-material.listener';
import {
  StudentDeliveryAssignmentCreateListener,
  StudentDeliveryAssignmentDeleteListener,
  StudentDeliveryAssignmentUpdateListener,
} from './controllers/events/listeners/student-delivery-assignment.listener';
import {
  StudentDeliveryFileCreateListener,
  StudentDeliveryFileDeleteListener,
  StudentDeliveryFileUpdateListener,
} from './controllers/events/listeners/student-delivery-file.listener';

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
    throw new Error('RIQUERY_RIAK_URIAK must be defined');
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
    riakWrapper.writeClient.stop(function () {
      logger.info('RIAK write-client is stopped');
      process.exit();
    });
  });

  // on terminate signal gracefull shutdown nats and riak
  process.on('SIGTERM', () => {
    natsWrapper.client.close();
    riakWrapper.queryClient.stop(function () {
      logger.info('RIAK query-client is stopped');
      process.exit();
    });
    riakWrapper.writeClient.stop(function () {
      logger.info('RIAK write-client is stopped');
      process.exit();
    });
  });

  // intitialize an event listener for every new assignment-material:create event
  new AssignmentMaterialCreateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new assignment-material:update event
  new AssignmentMaterialUpdateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new assignment-material:delete event
  new AssignmentMaterialDeleteListener(natsWrapper.client).listen();
  // intitialize an event listener for every new assignment-create event
  new AssignmentCreateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new assignment-update event
  new AssignmentUpdateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new assignment-dekete event
  new AssignmentDeleteListener(natsWrapper.client).listen();
  // intitialize an event listener for every new course-material-create event
  new CourseMaterialCreateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new course-material-update event
  new CourseMaterialUpdateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new course-material-delete event
  new CourseMaterialDeleteListener(natsWrapper.client).listen();
  // intitialize an event listener for every new course-create event
  new CourseCreateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new course-update event
  new CourseUpdateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new course-delete event
  new CourseDeleteListener(natsWrapper.client).listen();
  // intitialize an event listener for every new student-delivery-assignment-create event
  new StudentDeliveryAssignmentCreateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new student-delivery-assignment-update event
  new StudentDeliveryAssignmentUpdateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new student-delivery-assignment-delete event
  new StudentDeliveryAssignmentDeleteListener(natsWrapper.client).listen();
  // intitialize an event listener for every new  student-delivery-assignment-create event
  new StudentDeliveryFileCreateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new  student-delivery-assignment-update event
  new StudentDeliveryFileUpdateListener(natsWrapper.client).listen();
  // intitialize an event listener for every new  student-delivery-assignment-delete event
  new StudentDeliveryFileDeleteListener(natsWrapper.client).listen();

  // connet to mongoose/MongoDB
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  logger.info('Connected to MongoDb');

  // initialize express server to listen
  app.listen(3000, () => {
    logger.info('Listening on port 3000!!!!!!!!');
  });
};

catchAsync(start());
