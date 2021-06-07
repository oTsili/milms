import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');

import { catchAsync } from '@otmilms/common';

import { Assignment, User, Course, Material } from '../models/models';
import { UserDoc } from '../models/user';
import { AssignmentCreatedPublisher } from './events/publishers/assignments-publisher';
import { natsWrapper } from '../nats-wrapper';

// import APIFeatures from '../utils/apiFeatures';
// import fetch from 'node-fetch';
import { access, constants, mkdir } from 'fs';

import { riakWrapper } from '../riak-wrapper';
import { MaterialDoc } from '../models/material';

export const createMaterials = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;
    const creatorId = req.currentUser!.id;

    // 1) fetch the student's details
    const instructor = await User.findById(creatorId);

    // 2) fetch the assignment
    const currentAssignment = await Assignment.findById(assignmentId);

    // TODO: use fs.mkdir to create a directory of "courseName/assignmentName" instead of "courseName-assignmentName"

    // 4) create an array to keep account of the saved materialFiles
    let materialFiles: MaterialDoc[] = [];

    // 5) iterate through the files and build a db model for each
    const { names, lastUpdates, fileTypes } = req.body;

    for (let i = 0; i < req.files.length; i++) {
      const name = names[i];
      const lastUpdate = lastUpdates[i];
      const filePath = `api/courses/public/student-deliveries/${req.files[i].filename}`;
      const fileType = fileTypes[i];

      const createdStudentDeliveryFile = Material.build({
        name,
        filePath,
        fileType,
        lastUpdate,
        courseId,
        assignmentId,
        creatorId,
      });

      const updatedStudentDeliveryFile =
        await createdStudentDeliveryFile.save();

      materialFiles.push(updatedStudentDeliveryFile);
    }

    const fetchedMaterialFiles = await Material.find({
      assignmentId,
      creatorId,
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
      materialFiles,
      fetchedMaterialFiles,
    });
  }
);

export const getMaterials = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.courseId;
    const assignmentId = req.params.assignmentId;

    // get the materials of a specific assignment and a specific course
    let materialsQuery = Material.find({
      assignmentId: assignmentId,
      courseId: courseId,
    });

    let fetchedMaterials = await materialsQuery;

    const count = await materialsQuery.countDocuments();

    res.status(200).json({
      message: 'Materials fetched successfully!',
      materials: fetchedMaterials,
      maxMaterials: count,
    });
  }
);

export const deleteMaterial = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const materialId = req.params.materialId;
    const userId = req.currentUser!.id;
    const material = await Material.findById(materialId).populate('creatorId');
    const user = material!.creatorId as UserDoc;

    let result;

    if (
      user.role === 'admin' ||
      (user.role === 'instructor' && user.id === userId)
    ) {
      result = await Material.deleteOne({ _id: materialId });
    }

    if (result.n! > 0) {
      res.status(200).json({ message: 'Deletion successfull' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
);

export const downloadMaterial = (req: Request, res: Response) => {
  // const file = path.resolve(req.body.filePath);
  const file = path.join(
    __dirname,
    '..',
    `/public/materials/${req.body.filePath}`
  );

  res.download(file);
};

// return a blob file for reading pdf file
export const getBlobFile = catchAsync(async (req: Request, res: Response) => {
  const url = path.join(
    __dirname,
    '..',
    `/public/materials/${req.body.filePath}`
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
