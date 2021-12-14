import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  CourseMaterialsCreatedEvent,
  CourseMaterialsUpdatedEvent,
  CourseMaterialsDeletedEvent,
} from '@otmilms/common';
import { Material } from '../../../models/models';
// import { riakWrapper } from '../../../riak-wrapper';
import { RiakEvent } from './models-listeners';
const Riak = require('basho-riak-client');

export class CourseMaterialCreateListener extends Listener<CourseMaterialsCreatedEvent> {
  readonly subject = Subjects.CourseMaterialCreated;
  queueGroupName = 'course-material-created';

  async onMessage(data: CourseMaterialsCreatedEvent['data'], msg: Message) {
    const {
      id,
      name,
      lastUpdate,
      courseId,
      creatorId,
      time,
      user,
      email,
      filePath,
      fileType,
    } = data;

    const material = Material.build({
      id,
      name,
      lastUpdate,
      courseId,
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
    //     'course-material:created',
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

export class CourseMaterialUpdateListener extends Listener<CourseMaterialsUpdatedEvent> {
  readonly subject = Subjects.CourseMaterialUpdated;
  queueGroupName = 'course-material-updated';

  async onMessage(data: CourseMaterialsUpdatedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, creatorId, time, user, email } =
      data;

    const material = Material.updateOne(
      {
        id,
      },
      { name, lastUpdate, courseId, creatorId }
    );

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
    //     'course-material:updated',
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

export class CourseMaterialDeleteListener extends Listener<CourseMaterialsDeletedEvent> {
  readonly subject = Subjects.CourseMaterialDeleted;
  queueGroupName = 'course-material-deleted';

  async onMessage(data: CourseMaterialsDeletedEvent['data'], msg: Message) {
    const { id, name, lastUpdate, courseId, creatorId, time, user, email } =
      data;

    console.log('paok');

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
    //     'course-material:deleted',
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
