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
const Riak = require('basho-riak-client');

export class StudentDeliveryAssignmentCreateListener extends Listener<StudentDeliveryAssignmentCreatedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentCreated;
  queueGroupName = 'student-delivery-assignment:create';

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
    const eventMaterial = {
      name: material.name,
      lastUpdate: material.lastUpdate,
      studentId: material.studentId,
      courseId: material.courseId,
      assignmentId: material.assignmentId,
      instructorId: material.instructorId,
      studentName: material.studentName,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'student-delivery-assignment:create',
        eventMaterial.name,
        eventMaterial.lastUpdate,
        eventMaterial.studentId,
        eventMaterial.courseId,
        eventMaterial.assignmentId,
        eventMaterial.instructorId,
        eventMaterial.studentName,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('studentDeliveryAssignment')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryAssignmentUpdateListener extends Listener<StudentDeliveryAssignmentUpdatedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentUpdated;
  queueGroupName = 'student-delivery-assignment:update';

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
    } = data;

    const material = StudentDeliveryAssignment.updateOne(
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
    const eventMaterial = {
      name,
      lastUpdate,
      studentId,
      courseId,
      assignmentId,
      instructorId,
      studentName,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'student-delivery-assignment:update',
        eventMaterial.name,
        eventMaterial.lastUpdate,
        eventMaterial.studentId,
        eventMaterial.courseId,
        eventMaterial.assignmentId,
        eventMaterial.instructorId,
        eventMaterial.studentName,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('studentDeliveryAssignment')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class StudentDeliveryAssignmentDeleteListener extends Listener<StudentDeliveryAssignmentDeletedEvent> {
  readonly subject = Subjects.StudentDeliveryAssignmentDeleted;
  queueGroupName = 'student-delivery-assignment:delete';

  async onMessage(
    data: StudentDeliveryAssignmentDeletedEvent['data'],
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
    } = data;

    const material = StudentDeliveryAssignment.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      name,
      lastUpdate,
      studentId,
      courseId,
      assignmentId,
      instructorId,
      studentName,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'student-delivery-assignment:delete',
        eventMaterial.name,
        eventMaterial.lastUpdate,
        eventMaterial.studentId,
        eventMaterial.courseId,
        eventMaterial.assignmentId,
        eventMaterial.instructorId,
        eventMaterial.studentName,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('studentDeliveryAssignment')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
