import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');
import { BadRequestError, catchAsync, NotFoundError } from '@otmilms/common';

// import { courseCreatedPublisher } from './events/publishers/courses-publisher';
import { CourseDoc } from '../models/course';
import { Course, User } from '../models/models';
import { UserDoc } from '../models/user';
import { riakWrapper } from '../riak-wrapper';
import {
  CourseCreatedPublisher,
  CourseDeletedPublisher,
  CourseUpdatedPublisher,
} from './events/publishers/course-publisher';
import { natsWrapper } from '../nats-wrapper';

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

    const user = await User.findById(instructorId);
    // const userId = mongoose.Types.ObjectId(req.body.userId);
    const currentInstructor = await User.findById(instructorId);
    if (!currentInstructor) {
      throw new Error('Instructor not found');
    }

    let { title, description, semester, year, lastUpdate, instructor } =
      req.body;

    const course = Course.build({
      title,
      description,
      semester,
      year,
      lastUpdate,
      instructorId,
    });

    const currentCourse = await course.save();

    // populate the user's information

    await new CourseCreatedPublisher(natsWrapper.client).publish({
      id: course.id,
      title: course.title,
      description: course.description,
      semester: course.semester,
      year: course.year,
      lastUpdate: course.lastUpdate,
      instructorId: course.instructorId as string,
      user: `${user!.firstName} ${user!.lastName}`,
      email: user!.email,
      time: new Date(),
    });

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
    const userId = req.currentUser!.id;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('instructorId');

    if (!course) {
      throw new BadRequestError('The course was not found!');
    }
    const instructorId = course!.instructorId;

    let result;

    if (
      user!.role === 'admin' ||
      (user!.role === 'instructor' && `${user!.id}` === `${instructorId}`)
    ) {
      result = await Course.deleteOne({ _id: courseId });
    }

    await new CourseDeletedPublisher(natsWrapper.client).publish({
      id: course.id,
      title: course.title,
      description: course.description,
      semester: course.semester,
      year: course.year,
      lastUpdate: course.lastUpdate,
      instructorId: course.instructorId as string,
      user: `${user!.firstName} ${user!.lastName}`,
      email: user!.email,
      time: new Date(),
    });

    if (result.n! > 0) {
      res.status(200).json({ message: 'Deletion successfull' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

export const updateCourse = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser!.id;
    const user = await User.findById(userId);

    // create a course instance
    const updatedCourse = new Course({
      _id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      semester: req.body.semester,
      year: req.body.year,
      lastUpdate: req.body.lastUpdate,
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

    await new CourseUpdatedPublisher(natsWrapper.client).publish({
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      semester: updatedCourse.semester,
      year: updatedCourse.year,
      lastUpdate: updatedCourse.lastUpdate,
      instructorId: updatedCourse.instructorId as string,
      user: `${user!.firstName} ${user!.lastName}`,
      email: user!.email,
      time: new Date(),
    });

    res.status(200).json({
      message: 'update successful!',
      updatedCourse,
    });

    // // populate the user's information
    // await Assignment.populate(updatedAssignment, { path: 'creatorId' });
  }
);

export const getAuthEvents = catchAsync(async (req: Request, res: Response) => {
  const pageSize = +req.query.pagesize!;
  const currentPage = +req.query.page!;
  const userId = req.currentUser!.id;
  const user = await User.findById(userId);

  const startDate = new Date(req.body.startDate).getTime();
  const endDate = new Date(req.body.endDate).getTime();

  let eventsQuery;

  const countEventsQuery =
    'SELECT COUNT(*) FROM user WHERE time >' +
    startDate +
    'AND time < ' +
    endDate;

  /* if provided sosrt object send events sorted */
  let sortObj;
  if (`${req.query.sort}` !== '') {
    sortObj = JSON.parse(`${req.query.sort}`);

    let orderByElement;
    if (sortObj.active === 'user') {
      orderByElement = 'firstName';
    } else {
      orderByElement = sortObj.active;
    }

    if (sortObj.direction === 'asc') {
      eventsQuery =
        'SELECT * FROM user WHERE time >' +
        startDate +
        'AND time < ' +
        endDate +
        'ORDER BY ' +
        orderByElement +
        ' ASC LIMIT ' +
        pageSize +
        ' OFFSET ' +
        pageSize * (currentPage - 1);
    } else if (sortObj.direction === 'desc') {
      eventsQuery =
        'SELECT * FROM user WHERE time >' +
        startDate +
        'AND time < ' +
        endDate +
        'ORDER BY ' +
        orderByElement +
        ' DESC LIMIT ' +
        pageSize +
        ' OFFSET ' +
        pageSize * (currentPage - 1);
    }
  } else {
    eventsQuery =
      'SELECT * FROM user WHERE time >' +
      startDate +
      'AND time < ' +
      endDate +
      ' ORDER BY time DESC LIMIT ' +
      pageSize +
      ' OFFSET ' +
      pageSize * (currentPage - 1);
  }

  let userEvents: { [k: string]: any }[] = [];
  let maxEvents;
  var eventsCb = function (err, rslt) {
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

    /* START of count Events */
    var countEventsCb = function (err, rslt) {
      if (err) {
        console.log(err);
      } else {
        maxEvents = rslt.rows;

        // send a response with the found events
        res.status(200).json({
          message: 'Events fetched successfully!',
          events: userEvents,
          maxEvents: maxEvents[0][0].low,
        });
      }
    };

    const countEventsCmd = new Riak.Commands.TS.Query.Builder()
      .withQuery(countEventsQuery)
      .withCallback(countEventsCb)
      .build();

    riakWrapper.queryClient.execute(countEventsCmd);

    /*   END of count Events */
  };

  const eventsCmd = new Riak.Commands.TS.Query.Builder()
    .withQuery(eventsQuery)
    .withCallback(eventsCb)
    .build();

  if (user) {
    riakWrapper.queryClient.execute(eventsCmd);
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
