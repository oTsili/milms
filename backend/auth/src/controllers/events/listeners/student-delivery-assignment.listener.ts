import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  StudentDeliveryAssignmentCreatedEvent,
  StudentDeliveryAssignmentUpdatedEvent,
  StudentDeliveryAssignmentDeletedEvent,
} from '@otmilms/common';
import { Material, StudentDeliveryAssignment } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';
import { RiakEvent } from './models-listeners';
const Riak = require('basho-riak-client');

export class StudentDeliveryAssignmentCreateListener extends Listener<StudentDeliveryAssignmentCreatedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentCreated;
  queueGroupName = 'student-delivery-assignment-created';

  async onMessage(
    data: StudentDeliveryAssignmentCreatedEvent['data'],
    msg: Message
  ) {
    const {
      id,
      name,
      lastUpdate,
      studentId,
      courseId,
      assignmentId,
      instructorId,
      studentName,
      time,
      user,
      email,
    } = data;

    const material = StudentDeliveryAssignment.build({
      id,
      name,
      lastUpdate,
      studentId,
      courseId,
      assignmentId,
      instructorId,
      studentName,
    });

    await material.save();

    // filter the user information to be saved in RIAK DB as event
    const eventStudentDeliveryAssignment: RiakEvent = {
      user,
      email,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log([err]);
      } else {
        console.log({ rslt });
      }
    };

    var rows = [
      [
        eventStudentDeliveryAssignment.time,
        'student-delivery-assignment:created',
        eventStudentDeliveryAssignment.user,
        eventStudentDeliveryAssignment.email,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('course')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryAssignmentUpdateListener extends Listener<StudentDeliveryAssignmentUpdatedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentUpdated;
  queueGroupName = 'student-delivery-assignment-updated';

  async onMessage(
    data: StudentDeliveryAssignmentUpdatedEvent['data'],
    msg: Message
  ) {
    const {
      id,
      name,
      lastUpdate,
      studentId,
      courseId,
      assignmentId,
      instructorId,
      studentName,
      time,
      user,
      email,
    } = data;

    const studentDeliveryAssignment = StudentDeliveryAssignment.updateOne(
      {
        id,
      },
      {
        name,
        lastUpdate,
        studentId,
        courseId,
        assignmentId,
        instructorId,
        studentName,
      }
    );

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial: RiakEvent = {
      user,
      email,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log([err]);
      } else {
        console.log({ rslt });
      }
    };

    var rows = [
      [
        eventMaterial.time,
        'student-delivery-assignment:updated',
        eventMaterial.user,
        eventMaterial.email,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('course')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryAssignmentDeleteListener extends Listener<StudentDeliveryAssignmentDeletedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentDeleted;
  queueGroupName = 'student-delivery-assignment-deleted';

  async onMessage(
    data: StudentDeliveryAssignmentDeletedEvent['data'],
    msg: Message
  ) {
    const { id, name, lastUpdate, studentName, time, user, email } = data;

    const material = StudentDeliveryAssignment.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventStudentDeliveryAssignment: RiakEvent = {
      user,
      email,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log([err]);
      } else {
        console.log({ rslt });
      }
    };

    var rows = [
      [
        eventStudentDeliveryAssignment.time,
        'student-delivery-assignment:deleted',
        eventStudentDeliveryAssignment.user,
        eventStudentDeliveryAssignment.email,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('course')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
