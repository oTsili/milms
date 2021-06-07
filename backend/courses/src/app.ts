import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import bodyParser, { json } from 'body-parser';
import cookieSession from 'cookie-session';
import path from 'path';

import { corsOtions, errorHandler, NotFoundError } from '@otmilms/common';
import { currentUserRouter } from './routes/current-user';
import { CourseRouter } from './routes/courses';
import { UserRouter } from './routes/user';

// only for local testing - comment when run kubernetes
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.set('trust proxy', true);
// app.use(express.urlencoded());
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// only for local testing
if (process.env.NODE_ENV === 'test') {
  app.set('trust proxy', false);
  // use cors middleware
  const cors = require('cors');
  app.use(cors(corsOtions));
}

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== 'test',
    // secure: true, // true to send only via https
    secure: false,
  })
);

app.use(
  '/api/courses/public/assignments',
  express.static(path.join(__dirname, '/public/assignments'))
);

app.use(
  '/api/courses/public/course-materials',
  express.static(path.join(__dirname, '/public/course-materials'))
);

app.use(
  '/api/courses/public/assignment-materials',
  express.static(path.join(__dirname, '/public/assignment-materials'))
);

app.use(
  '/api/courses/public/student-deliveries',
  express.static(path.join(__dirname, '/public/student-deliveries'))
);

app.use(currentUserRouter);
// app.use('/api/assignments', AssignmentRouter);
app.use('/api/courses/user', UserRouter);
app.use('/api/courses', CourseRouter);

// only for local testing -- for serving angular through nodeJS
if (process.env.NODE_ENV === 'test' && process.env.BASE_PATH === 'node') {
  app.use('/', express.static(path.join(process.env.BASE_PATH, 'frontend')));
  app.use('', (req: Request, res: Response, next: NextFunction) => {
    res.sendFile(path.join(process.env.BASE_PATH!, 'frontend', 'index.html'));
  });
}

app.all('*', async (req: Request, res: Response) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
