import { Message } from 'node-nats-streaming';
import {
  Subjects,
  Listener,
  AssignmentCreatedEvent,
  AssignmentUpdatedEvent,
  AssignmentDeletedEvent,
} from '@otmilms/common';
import { Assignment } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';
const Riak = require('basho-riak-client');

export class AssignmentCreateListener extends Listener<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
  queueGroupName = 'assignment-create';

  async onMessage(data: AssignmentCreatedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, time } = data;

    const assignment = Assignment.build({
      id,
      title,
      description,
      lastUpdate,
    });

    await assignment.save();

    // filter the user information to be saved in RIAK DB as event
    const eventAssignment = {
      title: assignment.title,
      description: assignment.description,
      lastUpdate: assignment.lastUpdate,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventAssignment.time,
        'assignment:created',
        eventAssignment.title,
        eventAssignment.description,
        eventAssignment.lastUpdate,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('assignment')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class AssignmentUpdateListener extends Listener<AssignmentUpdatedEvent> {
  readonly subject = Subjects.AssignmentUpdated;
  queueGroupName = 'assignment-update';

  async onMessage(data: AssignmentUpdatedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, time } = data;

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

    // filter the user information to be saved in RIAK DB as event
    const eventAssignment = {
      title: title,
      description: description,
      lastUpdate: lastUpdate,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventAssignment.time,
        'assignment:update',
        eventAssignment.title,
        eventAssignment.description,
        eventAssignment.lastUpdate,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('assignment')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class AssignmentDeleteListener extends Listener<AssignmentDeletedEvent> {
  readonly subject = Subjects.AssignmentDeleted;
  queueGroupName = 'assignment-delete';

  async onMessage(data: AssignmentDeletedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, time } = data;

    const assignment = Assignment.deleteOne({
      id,
    });

    // filter the user information to be saved in RIAK DB as event
    const eventAssignment = {
      title: title,
      description: description,
      lastUpdate: lastUpdate,
      time: new Date(time),
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventAssignment.time,
        'assignment:delete',
        eventAssignment.title,
        eventAssignment.description,
        eventAssignment.lastUpdate,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('assignment')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
