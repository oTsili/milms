import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  AssignmentMaterialsCreatedEvent,
  AssignmentMaterialsUpdatedEvent,
  AssignmentMaterialsDeletedEvent,
} from '@otmilms/common';
import { Material } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';
const Riak = require('basho-riak-client');

export class AssignmentMaterialCreateListener extends Listener<AssignmentMaterialsCreatedEvent> {
  readonly subject = Subjects.AssignmentMaterialCreated;
  queueGroupName = 'assignment-material:create';

  async onMessage(data: AssignmentMaterialsCreatedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, assignmentId, creatorId, time } =
      data;

    const material = Material.build({
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
    });

    await material.save();

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      name: material.name,
      lastUpdate: material.lastUpdate,
      courseId: material.courseId,
      assignmentId: material.assignmentId,
      creatorId: material.creatorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'assignment-material:create',
        eventMaterial.name,
        eventMaterial.lastUpdate,
        eventMaterial.courseId,
        eventMaterial.assignmentId,
        eventMaterial.creatorId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('assignmentMaterial')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class AssignmentMaterialUpdateListener extends Listener<AssignmentMaterialsUpdatedEvent> {
  readonly subject = Subjects.AssignmentMaterialUpdated;
  queueGroupName = 'assignment-material:update';

  async onMessage(data: AssignmentMaterialsUpdatedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, assignmentId, creatorId, time } =
      data;

    const material = Material.updateOne(
      {
        id,
      },
      {
        name,
        lastUpdate,
        courseId,
        assignmentId,
        creatorId,
      }
    );

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'assignment-material:update',
        eventMaterial.name,
        eventMaterial.lastUpdate,
        eventMaterial.courseId,
        eventMaterial.assignmentId,
        eventMaterial.creatorId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('assignmentMaterial')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class AssignmentMaterialDeleteListener extends Listener<AssignmentMaterialsDeletedEvent> {
  readonly subject = Subjects.AssignmentMaterialDeleted;
  queueGroupName = 'assignment-material:delete';

  async onMessage(data: AssignmentMaterialsDeletedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, assignmentId, creatorId, time } =
      data;

    const material = Material.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventMaterial = {
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventMaterial.time,
        'assignment-material:delete',
        eventMaterial.name,
        eventMaterial.lastUpdate,
        eventMaterial.courseId,
        eventMaterial.assignmentId,
        eventMaterial.creatorId,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('assignmentMaterial')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
