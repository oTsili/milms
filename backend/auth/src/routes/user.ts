import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import path from 'path';
import {
  validateRequest,
  extractFile,
  currentUser,
  requireAuth,
} from '@otmilms/common';
import * as UserController from '../controllers/user';
import * as EventsController from '../controllers/events';

const router = express.Router();
const MIME_TYPE_MAP: { [key: string]: any } = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'imgage/jpg': 'jpg',
};

router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  UserController.signin
);

router.post(
  '/signup',
  // (req: Request, res: Response, next: NextFunction) => {
  //   console.log(req.body);
  //   next();
  // },
  extractFile(MIME_TYPE_MAP, 'src/public/img/users', 'photoPath'),
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('firstName').trim(),
    body('lastName').trim(),
    body('photoPath'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage('Password must be between 8 and 20 characters'),
    body('passwordConfirm')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw Error("Passwords don't match");
        } else {
          return value;
        }
      }),
  ],
  validateRequest,
  UserController.signup
);

router.get('/signout', currentUser, UserController.signout);

router.get('/become-admin', currentUser, UserController.becomeAdmin);

router.get('/become-student', currentUser, UserController.becomeStudent);

/////////////// Events ///////////////

router.post(
  '/events',
  currentUser,
  requireAuth,
  EventsController.getCourseEvents
);

export { router as UserRouter };
