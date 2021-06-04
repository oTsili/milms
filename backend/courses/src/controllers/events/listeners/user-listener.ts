import { Message } from 'node-nats-streaming';
const Riak = require('basho-riak-client');
var logger = require('winston');
import {
  Subjects,
  Listener,
  UserSignUpEvent,
  UserSignInEvent,
  UserSignOutEvent,
  UserUpdateEvent,
} from '@otmilms/common';

import { User } from '../../../models/models';
import { riakWrapper } from '../../../riak-wrapper';

export class UserSignUpListener extends Listener<UserSignUpEvent> {
  readonly subject = Subjects.UserSignUp;
  queueGroupName = 'user-signup';

  async onMessage(data: UserSignUpEvent['data'], msg: Message) {
    const { id, firstName, lastName, email, role, time } = data;

    const user = User.build({ id, firstName, lastName, email, role });

    await user.save();

    // filter the user information to be saved in RIAK DB as event
    const eventUser = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      time: new Date(time),
      role: role,
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
    };

    var rows = [
      [
        eventUser.time,
        'signup',
        eventUser.email,
        eventUser.firstName,
        eventUser.lastName,
        eventUser.role,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('user')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class UserSignInListener extends Listener<UserSignInEvent> {
  readonly subject = Subjects.UserSignIn;
  queueGroupName = 'signin';

  async onMessage(data: UserSignInEvent['data'], msg: Message) {
    const { id, firstName, lastName, email, role, time } = data;

    // filter the user information to be saved in RIAK DB as event
    const eventUser = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      time: new Date(time),
      role: role,
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log('error:', err);
      } else {
        console.log('store:', rslt);
      }
    };

    var rows = [
      [
        eventUser.time,
        'signin',
        eventUser.email,
        eventUser.firstName,
        eventUser.lastName,
        eventUser.role,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('user')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class UserSignOutListener extends Listener<UserSignOutEvent> {
  readonly subject = Subjects.UserSignOut;
  queueGroupName = 'signout';

  async onMessage(data: UserSignOutEvent['data'], msg: Message) {
    const { id, firstName, lastName, email, role, time } = data;

    // filter the user information to be saved in RIAK DB as event
    const eventUser = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      time: new Date(time),
      role: role,
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log('error:', err);
      } else {
        console.log('store:', rslt);
      }
    };

    var rows = [
      [
        eventUser.time,
        'signout',
        eventUser.email,
        eventUser.firstName,
        eventUser.lastName,
        eventUser.role,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('user')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}

export class UserUpdateListener extends Listener<UserUpdateEvent> {
  readonly subject = Subjects.UserUpdate;
  queueGroupName = 'update';

  async onMessage(data: UserUpdateEvent['data'], msg: Message) {
    console.log(data);
    const { id, firstName, lastName, email, role, time } = data;

    let updatedUser = await User.updateOne(
      // matching requirements
      {
        _id: id,
        email: email,
      },
      // the new values of assigment object
      {
        role: role,
      }
    );

    // console.log('updatedUser: ', updatedUser);
    
    // TODO: create a 'role' row in the RIAK table and include it in the eventUser below

    // filter the user information to be saved in RIAK DB as event
    const eventUser = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      time: new Date(time),
      role: role,
    };

    var cb = function (err, rslt) {
      // NB: rslt will be true when successful
      if (err) {
        console.log('error:', err);
      } else {
        console.log('store:', rslt);
      }
    };

    var rows = [
      [
        eventUser.time,
        'update',
        eventUser.email,
        eventUser.firstName,
        eventUser.lastName,
        eventUser.role,
      ],
    ];

    var cmd = new Riak.Commands.TS.Store.Builder()
      .withTable('user')
      .withRows(rows)
      .withCallback(cb)
      .build();

    riakWrapper.queryClient.execute(cmd);

    msg.ack();
  }
}
