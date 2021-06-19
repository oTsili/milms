import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  StudentDeliveryFileCreatedEvent,
  StudentDeliveryFileUpdatedEvent,
  StudentDeliveryFileDeletedEvent,
} from '@otmilms/common';
import { StudentDeliveryFile } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';
const Riak = require('basho-riak-client');

export class StudentDeliveryFileCreateListener extends Listener<StudentDeliveryFileCreatedEvent> {
  readonly subject = Subjects.StudentDeliveryFileCreated;
  queueGroupName = 'student-delivery-file:create';

  async onMessage(data: StudentDeliveryFileCreatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,

      time,
    } = data;

    const studentDeliveryFile = StudentDeliveryFile.build({
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,
    });

    await studentDeliveryFile.save();

    // filter the user information to be saved in RIAK DB as event
    const eventStudentDeliveryFile = {
      name: studentDeliveryFile.name,
      lastUpdate: studentDeliveryFile.lastUpdate,
      courseId: studentDeliveryFile.courseId,
      assignmentId: studentDeliveryFile.assignmentId,
      studentDeliveryAssignmentId:
        studentDeliveryFile.studentDeliveryAssignmentId,
      studentId: studentDeliveryFile.studentId,

      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventStudentDeliveryFile.time,
        'student-delivery-file:create',
        eventStudentDeliveryFile.name,
        eventStudentDeliveryFile.lastUpdate,
        eventStudentDeliveryFile.courseId,
        eventStudentDeliveryFile.assignmentId,
        eventStudentDeliveryFile.studentDeliveryAssignmentId,
        eventStudentDeliveryFile.studentId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('studentDeliveryFile')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryFileUpdateListener extends Listener<StudentDeliveryFileUpdatedEvent> {
  readonly subject = Subjects.StudentDeliveryFileUpdated;
  queueGroupName = 'student-delivery-file:update';

  async onMessage(data: StudentDeliveryFileUpdatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,

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

    // filter the user information to be saved in RIAK DB as event
    const eventStudentDeliveryFile = {
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,

      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventStudentDeliveryFile.time,
        'student-delivery-file:update',
        eventStudentDeliveryFile.name,
        eventStudentDeliveryFile.lastUpdate,
        eventStudentDeliveryFile.courseId,
        eventStudentDeliveryFile.assignmentId,
        eventStudentDeliveryFile.studentDeliveryAssignmentId,
        eventStudentDeliveryFile.studentId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('studentDeliveryFile')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryFileDeleteListener extends Listener<StudentDeliveryFileDeletedEvent> {
  readonly subject = Subjects.StudentDeliveryFileDeleted;
  queueGroupName = 'student-delivery-file:delete';

  async onMessage(data: StudentDeliveryFileDeletedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,

      time,
    } = data;

    const studentDeliveryFile = StudentDeliveryFile.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventStudentDeliveryFile = {
      name,
      lastUpdate,
      courseId,
      assignmentId,
      studentDeliveryAssignmentId,
      studentId,

      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventStudentDeliveryFile.time,
        'student-delivery-file:delete',
        eventStudentDeliveryFile.name,
        eventStudentDeliveryFile.lastUpdate,
        eventStudentDeliveryFile.courseId,
        eventStudentDeliveryFile.assignmentId,
        eventStudentDeliveryFile.studentDeliveryAssignmentId,
        eventStudentDeliveryFile.studentId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('studentDeliveryFile')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
