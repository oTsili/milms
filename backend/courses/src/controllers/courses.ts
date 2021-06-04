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
import { UserDoc } from '../models/user';

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
      courseQuery = courseQuery.sort([['courseTitle', 1]]);
    }

    let fetchedCourses: CourseDoc[];

    fetchedCourses = await courseQuery
      // .populate({ path: 'assignments', model: 'Assignment', key: 'id' })
      .populate('instructorId')
      .populate('creatorId')
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

export const createCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const instructorId = req.currentUser!.id;
    // const userId = mongoose.Types.ObjectId(req.body.userId);
    const currentInstructor = await User.findById(instructorId);
    if (!currentInstructor) {
      throw new Error('Instructor not found');
    }

    let { courseTitle, description, semester, year, createdAt, instructor } =
      req.body;

    const course = Course.build({
      courseTitle,
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
    const user = course!.instructorId as UserDoc;

    let result;

    console.log(user);

    console.log(`${user.id}` === `${userId}`);

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
      courseTitle: req.body.courseTitle,
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
