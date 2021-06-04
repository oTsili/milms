import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');

import { catchAsync } from '@otmilms/common';

import { Assignment, User, Course } from '../models/models';
import { AssignmentCreatedPublisher } from './events/publishers/assignments-publisher';
import { natsWrapper } from '../nats-wrapper';

// import APIFeatures from '../utils/apiFeatures';
// import fetch from 'node-fetch';
import { access, constants, mkdir } from 'fs';

import { riakWrapper } from '../riak-wrapper';
import { UserDoc } from '../models/user';

export const createAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let courseId = req.params.id;

    let courseQuery = Course.findById(courseId).populate('assignments');

    let currentCourse = await courseQuery;

    let dir = '';
    if (currentCourse) {
      dir = `src/public/assignments`;
    }

    const instructorId = req.currentUser!.id;

    // TODO: use fs.mkdir to create a directory of "courseName/assignmentName" instead of "courseName-assignmentName"
    // TODO: it was probably failling because I had to touch a test.txt file after mkdir, so that it can synchronize

    let filePath: string = '';
    if (req.file) {
      filePath = `api/courses/public/assignments/${req.file.filename}`;
    }

    const { title, description, fileType, lastUpdate, materials } = req.body;

    const newAssignment = Assignment.build({
      title,
      description,
      filePath,
      fileType,
      instructorId,
      courseId,
      lastUpdate,
      materials,
    });

    const createdAssignment = await newAssignment.save();

    currentCourse!.assignments!.push(createdAssignment);

    await currentCourse!.save();

    let updatedCourse = await courseQuery;

    if (createdAssignment.id && createdAssignment.description) {
      await new AssignmentCreatedPublisher(natsWrapper.client).publish({
        id: createdAssignment.id!,
        title: createdAssignment.title,
        description: createdAssignment.description!,
        lastUpdate: createdAssignment.lastUpdate.toString(),
        // rank: createdAssignment.rank!, // TODO: delete the rank, update the common lib, and make a subject assignment-delivery
        time: new Date(),
      });
    }

    res.status(201).json({
      message: 'Assignment added successfuly',
      updatedCourse,
    });

    // populate the user's information
    // await Assignment.populate(assignment, { path: 'creatorId' });
  }
);

export const updateAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let newFilePath = req.body.filePath;
    let fileType = req.body.fileType;
    let materials = req.body.materials;

    const userId = req.currentUser!.id;

    if (req.file) {
      // the path of files folder and filename
      newFilePath = `api/courses/public/assignments/${req.file.filename}`;

      fileType = `${req.file.mimetype}`;
    }

    // create an assignment instance
    const updatedAssignment = new Assignment({
      _id: req.params.assignmentId,
      title: req.body.title,
      description: req.body.description,
      createdAt: req.body.createdAt,
      creatorId: userId,
      filePath: newFilePath,
      fileType: fileType,
      materials: materials,
    });

    await Assignment.updateOne(
      // matching requirements
      {
        _id: req.params.assignmentId,
        creatorId: userId,
      },
      // the new values of assigment object
      updatedAssignment
    );

    res.status(200).json({
      message: 'update successful!',
      updatedAssignment,
    });
  }
);

export const getAssignments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pageSize = +req.query.pagesize!;
    const currentPage = +req.query.page!;

    let courseQuery = Course.findById(req.params.id);

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

    let fetchedCourse = await courseQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
      .populate('assignments')
      .populate('instructorId')
      .populate('materials');

    const count = fetchedCourse!.assignments!.length;

    res.status(200).json({
      message: 'Course fetched successfully!',
      course: fetchedCourse,
      maxAssignments: count,
    });
  }
);

// export const getAssignment = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const assignment = await Assignment.findById(req.params.id).populate(
//       'creatorId'
//     );
//     if (assignment) {
//       res.status(200).json(assignment);
//     } else {
//       res.status(404).json({
//         message: 'Assignment not found!',
//       });
//     }
//   }
// );

export const deleteAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const assignmentId = req.params.assignmentId;
    const userId = (<any>req).currentUser.courseId;

    const assignment = await Assignment.findById(assignmentId).populate(
      'instructorId'
    );
    const user = assignment!.instructorId as UserDoc;

    let result;

    if (
      user.role === 'admin' ||
      (user.role === 'instructor' && user.id === userId)
    ) {
      result = await Assignment.deleteOne({ _id: assignmentId });
    }

    if (result.n! > 0) {
      res.status(200).json({ message: 'Deletion successfull' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

export const downloadAssignment = (req: Request, res: Response) => {
  // const file = path.resolve(req.body.filePath);
  const file = path.join(
    __dirname,
    '..',
    `/public/assignments/${req.body.filePath}`
  );

  res.download(file);
};

// return a blob file for reading pdf file
export const getBlobFile = catchAsync(async (req: Request, res: Response) => {
  const url = path.join(
    __dirname,
    '..',
    `/public/assignments/${req.body.filePath}`
  );

  // // console.log(req.body.filePath);
  // // console.log(process.env.BARE_URL);

  // const baseURL = process.env.BARE_URL;

  // const newUrl = new URL(req.body.filePath, baseURL);
  // // console.log(newUrl);

  // const stats = fs.statSync(url2);
  // // console.log(stats);
  // const fileSizeInBytes = stats.size;
  // // console.log(fileSizeInBytes);
  // let readStream = fs.createReadStream(url2);
  // // console.log(readStream);

  // const response = await fetch(newUrl);

  // // console.log(response);
  // const blob = response.blob();
  // // console.log(blob);
  // // then((res) => {
  // //   console.log(res);
  // //   blob = res.blob();
  // //   console.log(blob);
  // // });

  res.status(200).sendFile(url);
});

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

const toHumanDateTime = (date: Date) => {
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

// export const   paginate = catchAsync(async (req: Request, res: Response) =>  {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//   }

// export const extractFileController = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     let courseId = req.params.id;

//     let courseAssignmentsQuery =
//       Course.findById(courseId).populate('assignments');

//     let currentCourse = await courseAssignmentsQuery;
//     let dir = '';

//     if (currentCourse) {
//       dir = `src/public/courses/${currentCourse.courseTitle}/assignments`;
//     }

//     access(dir, constants.F_OK, (err) => {
//       console.log(`${dir} ${err ? 'does not exist' : 'exists'}`);
//       mkdir(dir, { recursive: true }, (err) => {
//         if (err) {
//           return console.error(err);
//         }
//         console.log('Directory created successfully!');

//         extractFile(MIME_TYPE_MAP, dir, 'filePath');
//       });
//     });

//     next();
//   }
// );
