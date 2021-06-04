import express from 'express';
import { currentUser, extractFile } from '@otmilms/common';
const router = express.Router();

import * as CourseController from '../controllers/courses';
import * as AssignmentController from '../controllers/assignments';
import * as StudentDeliveriesController from '../controllers/studentDeliveries';
import * as UserController from '../controllers/user';
import { currentUserRouter } from './current-user';

router.get('/user-role', currentUser, UserController.getUserRole);

export { router as UserRouter };
