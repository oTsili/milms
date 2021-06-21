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
import { RiakEvent } from './models-listeners';
const Riak = require('basho-riak-client');

export class CourseCreateListener extends Listener<CourseCreatedEvent> {
  readonly subject = Subjects.CourseCreated;
  queueGroupName = 'course-created';

  async onMessage(data: CourseCreatedEvent['data'], msg: Message) {
    const {
      id,
      title,
      description,
      semester,
      year,
      lastUpdate,
      instructorId,
      time,
      user,
      email,
    } = data;

    const course = Course.build({
      id,
      title,
      description,
      semester,
      year,
      lastUpdate,
      instructorId,
    });

    await course.save();

    // filter the user information to be saved in RIAK DB as event
    const eventCourse: RiakEvent = {
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
      [eventCourse.time, 'course:created', eventCourse.user, eventCourse.email],
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
      lastUpdate,
      instructorId,
      time,
      user,
      email,
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
        lastUpdate,
      }
    );

    // filter the user information to be saved in RIAK DB as event
    const eventCourse: RiakEvent = {
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
      [eventCourse.time, 'course:updated', eventCourse.user, eventCourse.email],
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
      lastUpdate,
      time,
      user,
      email,
    } = data;

    const deltedCourse = Course.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventCourse: RiakEvent = { user, email, time: new Date(time) };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log([err]);
      } else {
        console.log({ rslt });
      }
    };

    var rows = [
      [eventCourse.time, 'course:deleted', eventCourse.user, eventCourse.email],
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
