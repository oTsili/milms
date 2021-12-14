import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { access, constants, mkdir } from 'fs';
import { BadRequestError, catchAsync } from '@otmilms/common';
import {
  Assignment,
  User,
  StudentDeliveryAssignment,
  StudentDeliveryFile,
} from '../models/models';
import {
  StudentDeliveryAssignmentCreatedPublisher,
  StudentDeliveryAssignmentUpdatedPublisher,
  StudentDeliveryFileCreatedPublisher,
  StudentDeliveryFileDeletedPublisher,
} from './events/publishers/course-publisher';
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

    let studentDeliveryAssignmentId: string;
    let updatedStudentDeliveryAssignment: StudentDeliveryAssignmentDoc;
    // 3a) if the studentDeliveryAssignment is allready saved get the id
    if (currentStudentDeliveryAssignment) {
      studentDeliveryAssignmentId = currentStudentDeliveryAssignment!._id;
      updatedStudentDeliveryAssignment = currentStudentDeliveryAssignment;
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
    const { names, fileTypes, comment } = req.body;
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const name = names[i];
        const filePath = `api/courses/public/student-deliveries/${req.files[i].filename}`;
        const fileType = fileTypes[i];
        const userId = req.currentUser!.id;
        const user = await User.findById(userId);

        const createdStudentDeliveryFile = StudentDeliveryFile.build({
          name,
          filePath,
          fileType,
          courseId,
          assignmentId,
          studentDeliveryAssignmentId,
          studentId,
        });

        const updatedStudentDeliveryFile =
          await createdStudentDeliveryFile.save();

        studentDeliveryFiles.push(updatedStudentDeliveryFile);

        await new StudentDeliveryFileCreatedPublisher(
          natsWrapper.client
        ).publish({
          id: updatedStudentDeliveryFile.id as string,
          name: updatedStudentDeliveryFile.name,
          lastUpdate: updatedStudentDeliveryFile.lastUpdate as Date,
          courseId: updatedStudentDeliveryFile.courseId as string,
          assignmentId: updatedStudentDeliveryFile.assignmentId as string,
          studentDeliveryAssignmentId:
            updatedStudentDeliveryFile.studentDeliveryAssignmentId as string,
          studentId: updatedStudentDeliveryFile.studentId as string,
          user: `${user!.firstName} ${user!.lastName}`,
          email: user!.email,
          filePath: updatedStudentDeliveryFile.filePath as string,
          fileType: updatedStudentDeliveryFile.fileType as string,
          time: new Date(),
        });

        await new StudentDeliveryAssignmentCreatedPublisher(
          natsWrapper.client
        ).publish({
          id: updatedStudentDeliveryFile.id as string,
          name: updatedStudentDeliveryFile.name,
          lastUpdate: updatedStudentDeliveryFile.lastUpdate as Date,
          studentId: updatedStudentDeliveryFile.studentId as string,
          courseId: updatedStudentDeliveryFile.courseId as string,
          assignmentId: updatedStudentDeliveryFile.assignmentId as string,
          instructorId: updatedStudentDeliveryAssignment!
            .instructorId as string,
          studentName: updatedStudentDeliveryAssignment!.studentName as string,
          user: `${user!.firstName} ${user!.lastName}`,
          email: user!.email,
          time: new Date(),
        });
      }
    }

    const fetchedStudentDeliveryFiles = await StudentDeliveryFile.find({
      courseId,
      // assignmentId,
      studentId,
    });

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
    let countStudentDeliveryFiles;

    if (user) {
      if (user.role === 'admin' || user.role === 'instructor') {
        studentDeliveryFilesQuery = StudentDeliveryFile.find({
          assignmentId,
          courseId,
        });

        countStudentDeliveryFiles =
          await StudentDeliveryAssignment.countDocuments({
            assignmentId,
            courseId,
          });
      } else if (user.role === 'student') {
        studentDeliveryFilesQuery = StudentDeliveryFile.find({
          assignmentId,
          courseId,
          studentId: userId,
        });

        countStudentDeliveryFiles =
          await StudentDeliveryAssignment.countDocuments({
            assignmentId,
            courseId,
            studentId: userId,
          });
      }
    }

    let fetchedStudentDeliveryFiles = await studentDeliveryFilesQuery
      .populate('studentId')
      .populate('studentDeliveryAssignmentId')
      .populate('assignmentId')
      .populate('courseId');

    res.status(200).json({
      message: "Assignment's total StudentDeliveryFiles fetched successfully!",
      fetchedStudentDeliveryFiles,
      countStudentDeliveryFiles,
    });
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
        .populate('assignmentId')
        .populate('courseId');

    res.status(200).json({
      message:
        "Assignment's total StudentDeliveryAssignments fetched successfully!",
      fetchedStudentDeliveryAssignments,
      countStudentDeliveryAssignments,
    });
  }
);

export const updateStudentDeliveryAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deliveryId = req.params.deliveryId;
    const userId = req.currentUser!.id;
    const user = await User.findById(userId);

    const { rank } = req.body;

    const filter = { _id: deliveryId };
    const update = { rank };

    await StudentDeliveryAssignment.updateOne(
      // matching requirements
      filter,
      // the new values of assigment object
      update
    );

    const fetchedStudentDeliveryAssignment =
      await StudentDeliveryAssignment.findById(deliveryId);

    if (fetchedStudentDeliveryAssignment) {
      await new StudentDeliveryAssignmentUpdatedPublisher(
        natsWrapper.client
      ).publish({
        id: fetchedStudentDeliveryAssignment.id as string,
        name: fetchedStudentDeliveryAssignment.name,
        lastUpdate: fetchedStudentDeliveryAssignment.lastUpdate as Date,
        studentId: fetchedStudentDeliveryAssignment.studentId as string,
        courseId: fetchedStudentDeliveryAssignment.courseId as string,
        assignmentId: fetchedStudentDeliveryAssignment.assignmentId as string,
        instructorId: fetchedStudentDeliveryAssignment!.instructorId as string,
        studentName: fetchedStudentDeliveryAssignment!.studentName as string,
        user: `${user!.firstName} ${user!.lastName}`,
        email: user!.email,
        time: new Date(),
      });
    }

    res.status(200).json({
      message: 'update successful!',
      fetchedStudentDeliveryAssignment,
    });
  }
);

export const deleteStudentDelivery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser!.id;
    const fileId = req.params.fileId;
    const user = await User.findById(userId);

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

      if (studentDeliveryFile) {
        await new StudentDeliveryFileDeletedPublisher(
          natsWrapper.client
        ).publish({
          id: studentDeliveryFile.id as string,
          name: studentDeliveryFile.name,
          lastUpdate: studentDeliveryFile.lastUpdate as Date,
          courseId: studentDeliveryFile.courseId as string,
          assignmentId: studentDeliveryFile.assignmentId as string,
          studentDeliveryAssignmentId:
            studentDeliveryFile.studentDeliveryAssignmentId as string,
          studentId: studentDeliveryFile.studentId as string,
          user: `${user!.firstName} ${user!.lastName}`,
          email: user!.email,
          filePath: studentDeliveryFile.filePath as string,
          fileType: studentDeliveryFile.fileType as string,
          time: new Date(),
        });
      }
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
