import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  StudentDeliveryFileCreatedEvent,
  StudentDeliveryFileUpdatedEvent,
  StudentDeliveryFileDeletedEvent,
} from '@otmilms/common';
import { StudentDeliveryFile } from '../../../models/models';
// import { riakWrapper } from '../../../riak-wrapper';
import { RiakEvent } from './models-listeners';
const Riak = require('basho-riak-client');

export class StudentDeliveryFileCreateListener extends Listener<StudentDeliveryFileCreatedEvent> {
  readonly subject = Subjects.StudentDeliveryFileCreated;
  queueGroupName = 'student-delivery-file-created';

  async onMessage(data: StudentDeliveryFileCreatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,
      user,
      email,
      time,
      filePath,
      fileType,
    } = data;

    const studentDeliveryFile = StudentDeliveryFile.build({
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,
      filePath,
      fileType,
    });

    await studentDeliveryFile.save();

    // // filter the user information to be saved in RIAK DB as event
    // const eventStudentDeliveryFile: RiakEvent = {
    //   user,
    //   email,
    //   time: new Date(time),
    // };

    // var cb = function (err, rslt) {
    //   // NB: rslt will be true when successful
    //   if (err) {
    //     console.log([err]);
    //   } else {
    //     console.log({ rslt });
    //   }
    // };

    // var rows = [
    //   [
    //     eventStudentDeliveryFile.time,
    //     'student-delivery-file:created',
    //     eventStudentDeliveryFile.user,
    //     eventStudentDeliveryFile.email,
    //   ],
    // ];

    // var cmd = new Riak.Commands.TS.Store.Builder()
    //   .withTable('course')
    //   .withRows(rows)
    //   .withCallback(cb)
    //   .build();

    // riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryFileUpdateListener extends Listener<StudentDeliveryFileUpdatedEvent> {
  readonly subject = Subjects.StudentDeliveryFileUpdated;
  queueGroupName = 'student-delivery-file-updated';

  async onMessage(data: StudentDeliveryFileUpdatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,
      user,
      email,
      time,
    } = data;

    const studentDeliveryFile = StudentDeliveryFile.updateOne(
      {
        id,
      },
      {
        name,
        lastUpdate,
        courseId,
        assignmentId,
        studentDeliveryAssignmentId,
        studentId,
      }
    );

    // // filter the user information to be saved in RIAK DB as event
    // const eventStudentDeliveryFile: RiakEvent = {
    //   user,
    //   email,
    //   time: new Date(time),
    // };

    // var cb = function (err, rslt) {
    //   // NB: rslt will be true when successful
    //   if (err) {
    //     console.log([err]);
    //   } else {
    //     console.log({ rslt });
    //   }
    // };

    // var rows = [
    //   [
    //     eventStudentDeliveryFile.time,
    //     'student-delivery-file:updated',
    //     eventStudentDeliveryFile.user,
    //     eventStudentDeliveryFile.email,
    //   ],
    // ];

    // var cmd = new Riak.Commands.TS.Store.Builder()
    //   .withTable('course')
    //   .withRows(rows)
    //   .withCallback(cb)
    //   .build();

    // riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryFileDeleteListener extends Listener<StudentDeliveryFileDeletedEvent> {
  readonly subject = Subjects.StudentDeliveryFileDeleted;
  queueGroupName = 'student-delivery-file-deleted';

  async onMessage(data: StudentDeliveryFileDeletedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,
      user,
      email,
      time,
    } = data;

    const studentDeliveryFile = StudentDeliveryFile.deleteOne({
      id,
    });

    // // filter the user information to be saved in RIAK DB as event
    // const eventStudentDeliveryFile: RiakEvent = {
    //   user,
    //   email,
    //   time: new Date(time),
    // };

    // var cb = function (err, rslt) {
    //   // NB: rslt will be true when successful
    //   if (err) {
    //     console.log([err]);
    //   } else {
    //     console.log({ rslt });
    //   }
    // };

    // var rows = [
    //   [
    //     eventStudentDeliveryFile.time,
    //     'student-delivery-file:deleted',
    //     eventStudentDeliveryFile.user,
    //     eventStudentDeliveryFile.email,
    //   ],
    // ];

    // var cmd = new Riak.Commands.TS.Store.Builder()
    //   .withTable('course')
    //   .withRows(rows)
    //   .withCallback(cb)
    //   .build();

    // riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
