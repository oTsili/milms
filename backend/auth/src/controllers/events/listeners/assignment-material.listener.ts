import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  AssignmentMaterialsCreatedEvent,
  AssignmentMaterialsUpdatedEvent,
  AssignmentMaterialsDeletedEvent,
} from '@otmilms/common';
import { Material } from '../../../models/models';
// import { riakWrapper } from '../../../riak-wrapper';
import { RiakEvent } from './models-listeners';
const Riak = require('basho-riak-client');

export class AssignmentMaterialCreateListener extends Listener<AssignmentMaterialsCreatedEvent> {
  readonly subject = Subjects.AssignmentMaterialCreated;
  queueGroupName = 'assignment-material-created';

  async onMessage(data: AssignmentMaterialsCreatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
      time,
      email,
      user,
      filePath,
      fileType,
    } = data;

    const material = Material.build({
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
      filePath,
      fileType,
    });

    await material.save();

    // // filter the user information to be saved in RIAK DB as event
    // const eventMaterial: RiakEvent = {
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
    //     eventMaterial.time,
    //     'assignment-material-created',
    //     eventMaterial.user,
    //     eventMaterial.email,
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

export class AssignmentMaterialUpdateListener extends Listener<AssignmentMaterialsUpdatedEvent> {
  readonly subject = Subjects.AssignmentMaterialUpdated;
  queueGroupName = 'assignment-material-updated';

  async onMessage(data: AssignmentMaterialsUpdatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
      time,
      user,
      email,
    } = data;

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

    // // filter the user information to be saved in RIAK DB as event
    // const eventMaterial: RiakEvent = {
    //   email,
    //   user,
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
    //     eventMaterial.time,
    //     'assignment-material:updated',
    //     eventMaterial.user,
    //     eventMaterial.email,
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

export class AssignmentMaterialDeleteListener extends Listener<AssignmentMaterialsDeletedEvent> {
  readonly subject = Subjects.AssignmentMaterialDeleted;
  queueGroupName = 'assignment-material-deleted';

  async onMessage(data: AssignmentMaterialsDeletedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      assignmentId,
      creatorId,
      time,
      user,
      email,
    } = data;

    const material = Material.deleteOne({
      id,
    });

    // // filter the user information to be saved in RIAK DB as event
    // const eventMaterial: RiakEvent = {
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
    //     eventMaterial.time,
    //     'assignment-material:deleted',
    //     eventMaterial.user,
    //     eventMaterial.email,
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
