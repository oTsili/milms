import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  AssignmentCreatedEvent,
  AssignmentUpdatedEvent,
  AssignmentDeletedEvent,
} from '@otmilms/common';
import { Assignment } from '../../../models/models';
// import { riakWrapper } from '../../../riak-wrapper';
import { RiakEvent } from './models-listeners';
const Riak = require('basho-riak-client');

export class AssignmentCreateListener extends Listener<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
  queueGroupName = 'assignment-created';

  async onMessage(data: AssignmentCreatedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, time, user, email } = data;

    const assignment = Assignment.build({
      id,
      title,
      description,
      lastUpdate,
    });

    await assignment.save();

    // // filter the user information to be saved in RIAK DB as event
    // const eventAssignment: RiakEvent = {
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
    //     eventAssignment.time,
    //     'assignment:created',
    //     eventAssignment.user,
    //     eventAssignment.email,
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

export class AssignmentUpdateListener extends Listener<AssignmentUpdatedEvent> {
  readonly subject = Subjects.AssignmentUpdated;
  queueGroupName = 'assignment-updated';

  async onMessage(data: AssignmentUpdatedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, time, user, email } = data;

    const assignment = Assignment.updateOne(
      {
        id,
      },
      {
        title,
        description,
        lastUpdate,
      }
    );

    // // filter the user information to be saved in RIAK DB as event
    // const eventAssignment: RiakEvent = {
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
    //     eventAssignment.time,
    //     'assignment:updated',
    //     eventAssignment.user,
    //     eventAssignment.email,
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

export class AssignmentDeleteListener extends Listener<AssignmentDeletedEvent> {
  readonly subject = Subjects.AssignmentDeleted;
  queueGroupName = 'assignment-deleted';

  async onMessage(data: AssignmentDeletedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, time, user, email } = data;

    const assignment = Assignment.deleteOne({
      id,
    });

    // // filter the user information to be saved in RIAK DB as event
    // const eventAssignment: RiakEvent = {
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
    //     eventAssignment.time,
    //     'assignment:deleted',
    //     eventAssignment.user,
    //     eventAssignment.email,
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
