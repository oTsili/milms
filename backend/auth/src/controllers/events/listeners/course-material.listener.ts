import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  CourseMaterialsCreatedEvent,
  CourseMaterialsUpdatedEvent,
  CourseMaterialsDeletedEvent,
} from '@otmilms/common';
import { Material } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';
const Riak = require('basho-riak-client');

export class CourseMaterialCreateListener extends Listener<CourseMaterialsCreatedEvent> {
  readonly subject = Subjects.CourseMaterialCreated;
  queueGroupName = 'course-material:create';

  async onMessage(data: CourseMaterialsCreatedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, creatorId, time } = data;

    const material = Material.build({
      id,
      name,
      lastUpdate,
      courseId,
      creatorId,
    });

    await material.save();

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      title: material.name,
      lastUpdate: material.lastUpdate,
      courseId: material.courseId,
      creatorId: material.creatorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'course-material:created',
        eventMaterial.title,
        eventMaterial.lastUpdate,
        eventMaterial.courseId,
        eventMaterial.creatorId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('courseMaterial')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class CourseMaterialUpdateListener extends Listener<CourseMaterialsUpdatedEvent> {
  readonly subject = Subjects.CourseMaterialUpdated;
  queueGroupName = 'course-material:update';

  async onMessage(data: CourseMaterialsUpdatedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, creatorId, time } = data;

    const material = Material.updateOne(
      {
        id,
      },
      { name, lastUpdate, courseId, creatorId }
    );

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      title: name,
      lastUpdate: lastUpdate,
      courseId: courseId,
      creatorId: creatorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'course-material:update',
        eventMaterial.title,
        eventMaterial.lastUpdate,
        eventMaterial.courseId,
        eventMaterial.creatorId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('courseMaterial')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class CourseMaterialDeleteListener extends Listener<CourseMaterialsDeletedEvent> {
  readonly subject = Subjects.CourseMaterialDeleted;
  queueGroupName = 'course-material:delete';

  async onMessage(data: CourseMaterialsDeletedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, creatorId, time } = data;

    const material = Material.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      title: name,
      lastUpdate: lastUpdate,
      courseId: courseId,
      creatorId: creatorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'course-material:delete',
        eventMaterial.title,
        eventMaterial.lastUpdate,
        eventMaterial.courseId,
        eventMaterial.creatorId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('courseMaterial')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
