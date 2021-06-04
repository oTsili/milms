import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');
import { catchAsync, extractFile } from '@otmilms/common';
import mongoose from 'mongoose';

// import { courseCreatedPublisher } from './events/publishers/courses-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CourseDoc } from '../models/course';
import { AssignmentDoc } from '../models/assignment';
import { Assignment, Course, User } from '../models/models';

export const getUserRole = catchAsync(async (req: Request, res: Response) => {
  const userId = req.currentUser!.id;

  const examinedUser = await User.findById(userId);
  let userRole: string | undefined;

  if (examinedUser) {
    userRole = examinedUser.role;
  }

  res.status(200).json({
    message: 'User role fetched successfully',
    userRole,
  });
});
