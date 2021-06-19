import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');
import { access, constants, mkdir } from 'fs';
import { BadRequestError, catchAsync } from '@otmilms/common';

import {
  Assignment,
  User,
  Course,
  StudentDeliveryAssignment,
  StudentDeliveryFile,
} from '../models/models';
import { riakWrapper } from '../riak-wrapper';
import { AssignmentCreatedPublisher } from './events/publishers/assignments-publisher';
import { natsWrapper } from '../nats-wrapper';
// import APIFeatures from '../utils/apiFeatures';
// import fetch from 'node-fetch';
import { StudentDeliveryFileDoc } from '../models/studentDeliveryFile';
import { StudentDeliveryAssignmentDoc } from '../models/studentDeliveryAssignment';

export const createStudentDelivery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;
    const studentId = req.currentUser!.id;

    // 1) fetch the student's details
    const student = await User.findById(studentId);

    // 2) fetch the assignment
    const currentAssignment = await Assignment.findById(assignmentId);

    // TODO: use fs.mkdir to create a directory of "courseName/assignmentName" instead of "courseName-assignmentName"

    // 3) fetch the studentDeliveryAssignment id for this assignmentId and studentId
    const studentDeliveryAssignmentQuery = StudentDeliveryAssignment.findOne({
      assignmentId,
      courseId,
      studentId,
    });

    const currentStudentDeliveryAssignment =
      await studentDeliveryAssignmentQuery;

    let updatedStudentDeliveryAssignment: StudentDeliveryAssignmentDoc;
    let studentDeliveryAssignmentId: string;

    // 3a) if the studentDeliveryAssignment is allready saved get the id
    if (currentStudentDeliveryAssignment) {
      studentDeliveryAssignmentId = currentStudentDeliveryAssignment!._id;
    } else {
      // 3b) else save a new one to the db and get the id
      const createdStudentDeliveryAssignment = StudentDeliveryAssignment.build({
        name: currentAssignment!.title,
        studentId,
        courseId,
        assignmentId,
        instructorId: currentAssignment!.instructorId,
        studentName: `${student?.firstName} ${student?.lastName}`,
      });

      updatedStudentDeliveryAssignment =
        await createdStudentDeliveryAssignment.save();

      studentDeliveryAssignmentId = updatedStudentDeliveryAssignment!._id;
    }

    // 4) create an array to keep account of the saved studentDeliveryFiles
    let studentDeliveryFiles: StudentDeliveryFileDoc[] = [];

    // 5) iterate through the files and build a db model for each
    const { names, lastUpdates, fileTypes, comment } = req.body;

    for (let i = 0; i < req.files.length; i++) {
      const name = names[i];
      const lastUpdate = lastUpdates[i];
      const filePath = `api/courses/public/student-deliveries/${req.files[i].filename}`;
      const fileType = fileTypes[i];

      const createdStudentDeliveryFile = StudentDeliveryFile.build({
        name,
        filePath,
        fileType,
        lastUpdate,
        courseId,
        assignmentId,
        studentDeliveryAssignmentId,
        studentId,
      });

      const updatedStudentDeliveryFile =
        await createdStudentDeliveryFile.save();

      studentDeliveryFiles.push(updatedStudentDeliveryFile);
    }

    const fetchedStudentDeliveryFiles = await StudentDeliveryFile.find({
      courseId,
      // assignmentId,
      studentId,
    });

    // 6)  publish the event
    // // make the query again for getting the populated fields
    // let updatedAssignment = await assignmentQuery;

    // if (createdAssignment.id && createdAssignment.description) {
    //   await new AssignmentCreatedPublisher(natsWrapper.client).publish({
    //     id: createdAssignment.id!,
    //     title: createdAssignment.title,
    //     description: createdAssignment.description!,
    //     lastUpdate: createdAssignment.lastUpdate.toString(),
    //     rank: createdAssignment.rank!,
    //     time: new Date(),
    //   });
    // }

    // 7) seng the response
    res.status(201).json({
      message: 'studentDeliveriesFiles added successfuly',
      studentDeliveryFiles,
      fetchedStudentDeliveryFiles,
    });
  }
);

export const getStudentDeliveries = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;
    const userId = req.currentUser!.id;

    // get user role
    const user = await User.findById(userId);

    let studentDeliveryFilesQuery;

    if (user) {
      if (user.role === 'admin' || user.role === 'instructor') {
        studentDeliveryFilesQuery = StudentDeliveryFile.find({
          assignmentId,
          courseId,
        });
      } else if (user.role === 'student') {
        studentDeliveryFilesQuery = StudentDeliveryFile.find({
          assignmentId,
          courseId,
          studentId: userId,
        });
      }
    }
  }
);

export const getStudentDeliveryAssignments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;
    const userId = req.currentUser!.id;

    // get user role
    const user = await User.findById(userId);

    let studentDeliveryAssignmentsQuery;
    let countStudentDeliveryAssignments;

    if (user) {
      if (user.role === 'admin' || user.role === 'instructor') {
        studentDeliveryAssignmentsQuery = StudentDeliveryAssignment.find({
          assignmentId,
          courseId,
        });

        countStudentDeliveryAssignments =
          await StudentDeliveryAssignment.countDocuments({
            assignmentId,
            courseId,
          });
      } else if (user.role === 'student') {
        studentDeliveryAssignmentsQuery = StudentDeliveryAssignment.find({
          assignmentId,
          courseId,
          studentId: userId,
        });

        countStudentDeliveryAssignments =
          await StudentDeliveryAssignment.countDocuments({
            assignmentId,
            courseId,
            studentId: userId,
          });
      }
    }
    let fetchedStudentDeliveryAssignments =
      await studentDeliveryAssignmentsQuery
        .populate('instructorId')
        .populate('studentId')
        .populate('instructorId')
        .populate('courseId');

    res.status(200).json({
      message:
        "Assignment's total StudentDeliveryAssignments fetched successfully!",
      fetchedStudentDeliveryAssignments,
      countStudentDeliveryAssignments,
    });
  }
);

export const deleteStudentDelivery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser!.id;
    const fileId = req.params.fileId;

    // 1) get the student id from the db
    const studentDeliveryFile = await StudentDeliveryFile.findById(fileId);

    const studentId = studentDeliveryFile!.studentId as string;

    let result;

    // 2) approve deletion only for the admin or the student who uploaded it
    const currentUser = await User.findById(userId);
    if (
      currentUser!.role === 'admin' ||
      (currentUser!.role === 'student' &&
        `${currentUser!._id}` === `${studentId}`)
    ) {
      result = await StudentDeliveryFile.deleteOne({
        _id: fileId,
      });
    } else {
      throw new BadRequestError('Not permitted to delete!');
    }

    // 3) send the response
    if (result.n! > 0) {
      res.status(200).json({ message: 'Delete successfull' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

export const downloadStudentDeliveryFile = (req: Request, res: Response) => {
  // const file = path.resolve(req.body.filePath);
  const file = path.join(
    __dirname,
    '..',
    `/public/student-deliveries/${req.body.filePath}`
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
