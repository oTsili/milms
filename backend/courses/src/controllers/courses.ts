import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');
import {
  BadRequestError,
  catchAsync,
  extractFile,
  NotFoundError,
} from '@otmilms/common';
import mongoose from 'mongoose';

// import { courseCreatedPublisher } from './events/publishers/courses-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CourseDoc } from '../models/course';
import { AssignmentDoc } from '../models/assignment';
import { Assignment, Course, User } from '../models/models';
import { UserDoc } from '../models/user';
import { riakWrapper } from '../riak-wrapper';

export const getCourses = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pageSize = +req.query.pagesize!;
    const currentPage = +req.query.page!;

    let courseQuery = Course.find();

    let sortObj;
    if (`${req.query.sort}` !== '') {
      sortObj = JSON.parse(`${req.query.sort}`);

      if (sortObj.direction === 'asc') {
        courseQuery = courseQuery.sort([[sortObj.active, 1]]);
      } else if (sortObj.direction === 'desc') {
        courseQuery = courseQuery.sort([[sortObj.active, -1]]);
      }
    } else {
      courseQuery = courseQuery.sort([['title', 1]]);
    }

    let fetchedCourses: CourseDoc[];

    fetchedCourses = await courseQuery
      // .populate({ path: 'assignments', model: 'Assignment', key: 'id' })
      .populate('instructorId')
      .populate('assignments')
      .populate('studentId')
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);

    const count = await Course.countDocuments();

    res.status(200).json({
      message: 'Courses fetched successfully!',
      courses: fetchedCourses,
      maxCourses: count,
    });

    // next();
  }
);

export const getCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const course = await Course.findById(req.params.id);
    // .populate(
    //   'creatorId'
    // );
    if (course) {
      res.status(200).json({ message: 'Course fetch successfully', course });
    } else {
      throw new NotFoundError();
    }
  }
);

export const createCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const instructorId = req.currentUser!.id;
    // const userId = mongoose.Types.ObjectId(req.body.userId);
    const currentInstructor = await User.findById(instructorId);
    if (!currentInstructor) {
      throw new Error('Instructor not found');
    }

    let { title, description, semester, year, createdAt, instructor } =
      req.body;

    const course = Course.build({
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
    });

    const currentCourse = await course.save();

    // populate the user's information

    // if (createdCourse.id && createdCourse.description) {
    // await new courseCreatedPublisher(natsWrapper.client).publish({
    //   id: createdCourse.id!,
    //   title: createdCourse.title,
    // });
    // }

    res.status(201).json({
      message: 'course added successfuly',
      currentCourse,
    });

    // populate the user's information
    // await course.populate(course, { path: 'creatorId' });
  }
);

export const deleteCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id;
    const userId = (<any>req).currentUser.id;

    const course = await Course.findById(courseId).populate('instructorId');

    if (!course) {
      throw new BadRequestError('The course was not found!');
    }
    const user = course!.instructorId as UserDoc;

    let result;

    if (
      user.role === 'admin' ||
      (user.role === 'instructor' && `${user.id}` === `${userId}`)
    ) {
      result = await Course.deleteOne({ _id: courseId });
    }

    if (result.n! > 0) {
      res.status(200).json({ message: 'Deletion successfull' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

export const updateCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (<any>req).currentUser.id;
    // const user = await User.findById(userId);
    // const userId = mongoose.Types.ObjectId(req.body.id);

    // create a course instance
    const updatedCourse = new Course({
      _id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      semester: req.body.semester,
      year: req.body.year,
      createdAt: req.body.createdAt,
      instructorId: userId,
    });

    await Course.updateOne(
      // matching requirements
      {
        _id: req.params.id,
        instructorId: userId,
      },
      // the new values of assigment object
      updatedCourse
    );

    res.status(200).json({
      message: 'update successful!',
      updatedCourse,
    });

    // // populate the user's information
    // await Assignment.populate(updatedAssignment, { path: 'creatorId' });
  }
);

export const getAuthEvents = catchAsync(async (req: Request, res: Response) => {
  const userId = (<any>req).currentUser.id;
  const user = await User.findById(userId);

  const startDate = new Date(req.body.startDate).getTime();
  const endDate = new Date(req.body.endDate).getTime();

  var query =
    'select * from user where time >' + startDate + 'and time < ' + endDate;

  let userEvents: { [k: string]: any }[] = [];

  var cb = function (err, rslt) {
    if (err) {
      console.log(err);
    } else {
      rslt.rows.forEach((row: string) => {
        let cols = row.toString().split(',');
        userEvents.push(
          Object.fromEntries(
            new Map([
              ['time', toHumanDateTime(new Date(+cols[0]))],
              ['event', cols[1]],
              ['email', cols[2]],
              ['firstName', cols[3]],
              ['lastName', cols[4]],
            ])
          )
        );
      });
    }

    // send a response with the found events
    res.status(200).json({
      message: 'Events fetched successfully!',
      events: userEvents,
    });
  };

  var cmd = new Riak.Commands.TS.Query.Builder()
    .withQuery(query)
    .withCallback(cb)
    .build();

  if (user) {
    riakWrapper.queryClient.execute(cmd);
  } else {
    throw new Error('user not found');
  }
});

export const toHumanDateTime = (date: Date) => {
  let month = (date.getMonth() + 1).toString();

  let newDateArray = date.toDateString().split(' ');
  // delete the day name
  newDateArray.splice(0, 1);
  // change the month name to month numbers
  newDateArray.splice(0, 1, month);
  // monve the month to the center
  monveInArray(newDateArray, 0, 1);
  let newDate = newDateArray.join(' ').replace(/\ /g, '/');
  let newTime = date.toTimeString().split(' ')[0];

  return `${newDate} ${newTime}`;
};

const monveInArray = (arr: string[], from: number, to: number): void => {
  let item = arr.splice(from, 1);

  arr.splice(to, 0, item[0]);
};
