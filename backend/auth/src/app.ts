import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { corsOtions, errorHandler, NotFoundError } from '@otmilms/common';
import path from 'path';

import { currentUserRouter } from './routes/current-user';
import { UserRouter } from './routes/user';

// only for local testing - comment when run kubernetes
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.set('trust proxy', true);

app.use(json());

// only for local testing no k8s
if (process.env.NODE_ENV === 'test') {
  app.use(
    '/public/img/users',
    express.static(path.join('src/public/img/users'))
  );
  app.set('trust proxy', false);
  //use cors middleware
  const cors = require('cors');
  app.use(cors(corsOtions));
}

app.use(
  cookieSession({
    signed: false,
    secure: true,
    // secure: process.env.NODE_ENV !== 'test',
    // maxAge: parseInt(process.env.EXPIRATION_IN!),
  })
);

app.use(
  '/api/users/public/img',
  express.static(path.join(__dirname, '/public/img'))
);
app.use(currentUserRouter);
app.use('/api/users', UserRouter);

// only for local testing -- for serving angular through nodeJS
if (
  process.env.NODE_ENV === 'one_server_test' &&
  process.env.BASE_PATH === 'node'
) {
  app.use('/', express.static(path.join(process.env.BASE_PATH, 'frontend')));
  app.use('', (req, res, next) => {
    res.sendFile(path.join(process.env.BASE_PATH!, 'frontend', 'index.html'));
  });
}

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
