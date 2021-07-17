import { Request, Response, NextFunction } from 'express';
import { BadRequestError, catchAsync, NotFoundError } from '@otmilms/common';
import { CourseDoc } from '../models/course';
import { Course, User } from '../models/models';
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
    let filterValues = req.query.filter! as string;

    const { years, semesters } = distinguishFilterValues(filterValues);

    let courseQuery;

    if (semesters.length > 0) {
      courseQuery = Course.find({
        semester: { $in: semesters },
      });
    } else if (years.length > 0) {
      courseQuery = Course.find({
        year: { $in: years },
      });
    } else if (years.length > 0 && semesters.length > 0) {
      courseQuery = Course.find({
        semester: { $in: semesters },
        year: { $in: years },
      });
    } else {
      courseQuery = Course.find();
    }

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

const distinguishFilterValues = (
  filterValues: string
): { years: string[]; semesters: string[] } => {
  // const years = filterValues.filter(
  //   (value) => typeof parseInt(value) === 'number'
  // );
  const years = filterValues
    .replace(/\D+/g, ' ')
    .split(' ')
    .filter((year) => year !== ''); // replace non-digits with space

  const semesters = filterValues
    .split(',')
    .filter((value) => !years.includes(value))
    .filter((value) => value !== '');

  return { years, semesters };
};
