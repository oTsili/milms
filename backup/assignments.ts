import { AssignmentDoc } from '../models/assignment';
import { Assignment, User } from '../models/models';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
var logger = require('winston');
const Riak = require('basho-riak-client');

import { catchAsync } from '@otmilms/common';
import { AssignmentCreatedPublisher } from './events/publishers/assignments-publisher';
import { natsWrapper } from '../nats-wrapper';

// import { json } from 'body-parser';
// import APIFeatures from '../utils/apiFeatures';
// import fetch from 'node-fetch';
// import fs from 'fs';
import { riakWrapper } from '../riak-wrapper';

export const createAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (<any>req).currentUser.id;
    // const userId = mongoose.Types.ObjectId(req.body.userId);
    // const user = await User.findById(userId);

    let url = 'api/assignments';
    if (process.env.NODE_ENV === 'test') {
      url = `${req.protocol}://${req.get('host')}`;
    }

    let assignmentPath: string = '';
    if ((<any>req).file) {
      assignmentPath = `${url}/public/assignments/${(<any>req).file.filename}`;
    }

    const assignment = new Assignment({
      title: req.body.title,
      description: req.body.description,
      filePath: assignmentPath,
      fileType: req.body.fileType,
      createdAt: req.body.lastUpdate,
      creatorId: userId,
      rank: req.body.rank,
    });

    const createdAssignment = await assignment.save();

    // if (createdAssignment.id && createdAssignment.description) {
    await new AssignmentCreatedPublisher(natsWrapper.client).publish({
      id: createdAssignment.id!,
      title: createdAssignment.title,
      description: createdAssignment.description!,
      lastUpdate: createdAssignment.createdAt.toString(),
      rank: createdAssignment.rank!,
      time: new Date(),
    });
    // }

    res.status(201).json({
      message: 'Assignment added successfuly',
      createdAssignment,
    });

    // populate the user's information
    // await Assignment.populate(assignment, { path: 'creatorId' });
  }
);

export const updateAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let newRank = req.body.rank;

    let newFilePath = req.body.filePath;
    let fileType = req.body.fileType;
    const userId = (<any>req).currentUser.id;
    // const user = await User.findById(userId);
    // const userId = mongoose.Types.ObjectId(req.body.id);

    ///////  SOS SOS SOS SOS ---- copy the dbs from each microservice (auth, assignment) ---  /////

    // if the update includes a new file uploading

    if (req.file) {
      // protocol: http/https , host: domain
      let url = 'api/assignments';
      if (process.env.NODE_ENV === 'test') {
        url = `${req.protocol}://${req.get('host')}`;
      }

      // the rest path of files folder and filename
      newFilePath = `${url}/public/assignments/${req.file.filename}`;
      fileType = `${req.file.mimetype}`;
    }

    // create an assignment instance
    const updatedAssignment = new Assignment({
      _id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      createdAt: req.body.createdAt,
      creatorId: userId,
      filePath: newFilePath,
      fileType: fileType,
      rank: parseFloat(newRank),
    });

    await Assignment.updateOne(
      // matching requirements
      {
        _id: req.params.id,
        creatorId: userId,
      },
      // the new values of assigment object
      updatedAssignment
    );

    res.status(200).json({
      message: 'update successful!',
      updatedAssignment,
    });

    // // populate the user's information
    // await Assignment.populate(updatedAssignment, { path: 'creatorId' });
  }
);

export const getAssignments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pageSize = +req.query.pagesize!;
    const currentPage = +req.query.page!;
    let assignmentQuery = Assignment.find();

    let sortObj;
    if (`${req.query.sort}` !== '') {
      sortObj = JSON.parse(`${req.query.sort}`);

      if (sortObj.direction === 'asc') {
        assignmentQuery = assignmentQuery.sort([[sortObj.active, 1]]);
      } else if (sortObj.direction === 'desc') {
        assignmentQuery = assignmentQuery.sort([[sortObj.active, -1]]);
      }
    } else {
      assignmentQuery = assignmentQuery.sort([['title', 1]]);
    }

    let fetchedAssignments: AssignmentDoc[];

    if (!pageSize && !currentPage) {
      fetchedAssignments = await assignmentQuery.populate('creatorId');
    } else {
      fetchedAssignments = await assignmentQuery
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .populate('creatorId');
    }

    const count = await Assignment.countDocuments();

    res.status(200).json({
      message: 'Assignments fetched successfully!',
      assignments: fetchedAssignments,
      maxAssignments: count,
    });

    // next();
  }
);

export const getAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const assignment = await Assignment.findById(req.params.id).populate(
      'creatorId'
    );
    if (assignment) {
      res.status(200).json(assignment);
    } else {
      res.status(404).json({
        message: 'Assignment not found!',
      });
    }
  }
);

export const deleteAssignment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const assignmentId = req.params.id;
    const userId = (<any>req).currentUser.id;
    const result = await Assignment.deleteOne({
      _id: req.params.id,
      creatorId: userId,
    });

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
  // const file = path.resolve(req.body.filePath);

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

  let userSignUpEvents;
  let userSignInEvents;

  var cb = function (err, rslt) {
    // NB: rslt will be an object with two properties:
    // 'columns' - table columns
    // 'rows' - row matching the Get request
  };

  var cmd = new Riak.Commands.TS.Get.Builder()
    .withTable('GeoCheckin')
    .withKey([user!.email])
    .withCallback(cb)
    .build();

  if (user) {
    // fetch sign-up events
    riakWrapper.queryClient.fetchValue(
      { bucket: 'user-signup', key: user.email, convertToJs: true },
      function (err, rslt) {
        if (err) {
          throw new Error(err);
        } else {
          userSignUpEvents = rslt.values.map((events) => events.value);

          // fetch sign-in events
          riakWrapper.queryClient.fetchValue(
            { bucket: 'user-signin', key: user.email, convertToJs: true },
            function (err, rslt) {
              if (err) {
                throw new Error(err);
              } else {
                // console.log(rslt);
                userSignInEvents = rslt.values.map((events) => events.value);

                console.log('signup events:', userSignUpEvents);
                console.log('signin events:', userSignInEvents);

                // send a response with the found events
                res.status(200).json({
                  message: 'Events fetched successfully!',
                  events: {
                    signup: userSignUpEvents,
                    signin: userSignInEvents,
                  },
                });
              }
            }
          );
        }
      }
    );
  } else {
    throw new Error('user not found');
  }
});

// export const   paginate = catchAsync(async (req: Request, res: Response) =>  {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//   }
