import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  CourseCreatedEvent,
  CourseUpdatedEvent,
  CourseDeletedEvent,
} from '@otmilms/common';
import { Course } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';
const Riak = require('basho-riak-client');

export class CourseCreateListener extends Listener<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
  queueGroupName = 'course-create';

  async onMessage(data: CourseCreatedEvent['data'], msg: Message) {
    const {
      id,
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
      time,
    } = data;

    const course = Course.build({
      id,
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
    });

    await course.save();

    // filter the user information to be saved in RIAK DB as event
    const eventCourse = {
      title: course.title,
      description: course.description,
      semester: course.semester,
      year: course.year,
      createdAt: course.createdAt,
      instructorId: course.instructorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventCourse.time,
        'course:created',
        eventCourse.description,
        eventCourse.semester,
        eventCourse.year,
        eventCourse.createdAt,
        eventCourse.instructorId,
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

export class CourseUpdateListener extends Listener<CourseUpdatedEvent> {
  readonly subject = Subjects.CourseUpdated;
  queueGroupName = 'course-updated';

  async onMessage(data: CourseUpdatedEvent['data'], msg: Message) {
    const {
      id,
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
      time,
    } = data;

    const updatedCourse = Course.updateOne(
      {
        id,
      },
      {
        title,
        description,
        semester,
        year,
        createdAt,
        instructorId,
      }
    );

    // filter the user information to be saved in RIAK DB as event
    const eventCourse = {
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventCourse.time,
        'course:updated',
        eventCourse.description,
        eventCourse.semester,
        eventCourse.year,
        eventCourse.semester,
        eventCourse.createdAt,
        eventCourse.instructorId,
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

export class CourseDeleteListener extends Listener<CourseDeletedEvent> {
  readonly subject = Subjects.CourseDeleted;
  queueGroupName = 'course-deleted';

  async onMessage(data: CourseDeletedEvent['data'], msg: Message) {
    const {
      id,
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
      time,
    } = data;

    const deltedCourse = Course.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventCourse = {
      title,
      description,
      semester,
      year,
      createdAt,
      instructorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventCourse.time,
        'course:deleted',
        eventCourse.description,
        eventCourse.semester,
        eventCourse.year,
        eventCourse.semester,
        eventCourse.createdAt,
        eventCourse.instructorId,
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
