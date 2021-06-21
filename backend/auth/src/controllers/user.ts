// import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { catchAsync, BadRequestError, UserPayload } from '@otmilms/common';
import dotenv from 'dotenv';
const Riak = require('basho-riak-client');

import { GeneratePassword } from '../services/generate-password';
import { User } from '../models/models';
import { UserAttrs } from '../models/user';
import {
  UserSignInPublisher,
  UserSignUpPublisher,
  UserSignOutPublisher,
  UserUpdatePublisher,
} from './events/publishers/user-publisher';
import { natsWrapper } from '../nats-wrapper';
import { riakWrapper } from '../riak-wrapper';

const expiration_token = process.env.EXPIRES_IN || '3600';
dotenv.config();

// export const resizeUserPhoto = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (!(<any>req).file) return next();

//     (<any>req).file.filename = `user-${(<any>req).user.id}-${Date.now()}.jpeg`;

//     await sharp((<any>req).file.buffer)
//       .resize(500, 500)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toFile(`public/img/users/${(<any>req).file.filename}`);

//     next();
//   }
// );

export const signin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }

  const passwordsMatch = await GeneratePassword.compare(
    existingUser.password,
    password
  );
  if (!passwordsMatch) {
    throw new BadRequestError('Invalid Credentials');
  }

  await new UserSignInPublisher(natsWrapper.client).publish({
    id: existingUser.id!,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName!,
    email: existingUser.email,
    role: existingUser.role!,
    time: new Date(),
  });

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: existingUser._id,
      // firstName: existingUser.firstName,
      email: existingUser.email,
      // photoPath: photoPath,
    },
    process.env.JWT_KEY!
    // { expiresIn: parseInt(expiration_token) }
  );

  // Store it on session object
  req.session = {
    jwt: userJwt,
  };

  const data = {
    existingUser: existingUser,
    expiresIn: expiration_token,
  };

  res.status(200).send(data);
});

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, passwordConfirm, firstName, lastName } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email in use');
  }
  // on container or localhost
  let url = `/api/users`;
  if (process.env.NODE_ENV === 'test') {
    url = `${req.protocol}://${req.get('host')}`;
  }

  let photoPath = `${url}/public/img/default.jpg`;
  if ((<any>req).file) {
    photoPath = `${url}/public/img/users/${(<any>req).file.filename}`;
  }

  const userAttrs: UserAttrs = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    passwordConfirm: passwordConfirm,
    photoPath: photoPath,
  };

  const user = User.build(userAttrs);

  await user.save();

  await new UserSignUpPublisher(natsWrapper.client).publish({
    id: user.id!,
    firstName: user.firstName,
    lastName: user.lastName!,
    email: user.email,
    role: user.role!,
    time: new Date(),
  });

  // Generate JWT
  const userJwt = jwt.sign(
    {
      id: user._id,
      // userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      // photo: photoPath,
      // expiresIn: expiration_token,
    },
    process.env.JWT_KEY!
    // { expiresIn: expiration_token }
  );

  // Store it on session object
  req.session = {
    jwt: userJwt,
  };

  const data = {
    existingUser: user,
    expiresIn: expiration_token,
  };

  res.status(200).send(data);
});

export const signout = catchAsync(async (req: Request, res: Response) => {
  req.session = null;

  const { id, email }: UserPayload = req.currentUser!;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new BadRequestError('Invalid user');
  }

  await new UserSignOutPublisher(natsWrapper.client).publish({
    id: existingUser.id!,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName!,
    email: existingUser.email,
    role: existingUser.role!,
    time: new Date(),
  });

  res.send({});
});

export const becomeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id, email }: UserPayload = req.currentUser!;

  const query = { email };
  const existingUser = await User.findOneAndUpdate(query, { role: 'admin' });

  if (!existingUser) {
    throw new BadRequestError('Invalid user');
  }

  await new UserUpdatePublisher(natsWrapper.client).publish({
    id: existingUser.id!,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName!,
    email: existingUser.email,
    role: existingUser.role!,
    time: new Date(),
  });

  res.status(200).send({
    message: 'user updated',
    existingUser,
  });
});

export const becomeStudent = catchAsync(async (req: Request, res: Response) => {
  const { id, email }: UserPayload = req.currentUser!;

  const query = { email };
  const existingUser = await User.findOneAndUpdate(query, { role: 'student' });

  if (!existingUser) {
    throw new BadRequestError('Invalid user');
  }

  await new UserUpdatePublisher(natsWrapper.client).publish({
    id: existingUser.id!,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName!,
    email: existingUser.email,
    role: existingUser.role!,
    time: new Date(),
  });

  res.status(200).send({
    message: 'user updated',
    existingUser,
  });
});

export const getCourseEvents = catchAsync(
  async (req: Request, res: Response) => {
    const pageSize = +req.query.pagesize!;
    const currentPage = +req.query.page!;
    const userId = req.currentUser!.id;
    const user = await User.findById(userId);

    const startDate = new Date(req.body.startDate).getTime();
    const endDate = new Date(req.body.endDate).getTime();

    let eventsQuery;

    const countEventsQuery =
      'SELECT COUNT(*) FROM course WHERE time >' +
      startDate +
      'AND time < ' +
      endDate;

    /* if provided sosrt object send events sorted */
    let sortObj;
    if (`${req.query.sort}` !== '') {
      sortObj = JSON.parse(`${req.query.sort}`);

      if (sortObj.direction === 'asc') {
        eventsQuery =
          'SELECT * FROM course WHERE time >' +
          startDate +
          'AND time < ' +
          endDate +
          'ORDER BY ' +
          sortObj.active +
          ' ASC LIMIT ' +
          pageSize +
          ' OFFSET ' +
          pageSize * (currentPage - 1);
      } else if (sortObj.direction === 'desc') {
        eventsQuery =
          'SELECT * FROM course WHERE time >' +
          startDate +
          'AND time < ' +
          endDate +
          'ORDER BY ' +
          sortObj.active +
          ' DESC LIMIT ' +
          pageSize +
          ' OFFSET ' +
          pageSize * (currentPage - 1);
      }
    } else {
      eventsQuery =
        'SELECT * FROM course WHERE time >' +
        startDate +
        'AND time < ' +
        endDate +
        ' ORDER BY time DESC LIMIT ' +
        pageSize +
        ' OFFSET ' +
        pageSize * (currentPage - 1);
    }

    let userEvents: { [k: string]: any }[] = [];
    let maxEvents;
    var eventsCb = function (err, rslt) {
      if (err) {
        console.log(err);
      } else {
        rslt.rows.forEach((row: string) => {
          let cols = row.toString().split(',');
          userEvents.push(
            Object.fromEntries(
              new Map([
                ['time', toHumanDateTime(new Date(+cols[0]))],
                ['event', cols[1]],
                ['email', cols[2]],
                ['user', cols[3]],
              ])
            )
          );
        });
      }

      /* START of count Events */
      var countEventsCb = function (err, rslt) {
        if (err) {
          console.log(err);
        } else {
          maxEvents = rslt.rows;

          // send a response with the found events
          res.status(200).json({
            message: 'Events fetched successfully!',
            events: userEvents,
            maxEvents: maxEvents[0][0].low,
          });
        }
      };

      const countEventsCmd = new Riak.Commands.TS.Query.Builder()
        .withQuery(countEventsQuery)
        .withCallback(countEventsCb)
        .build();

      riakWrapper.queryClient.execute(countEventsCmd);

      /*   END of count Events */
    };

    const eventsCmd = new Riak.Commands.TS.Query.Builder()
      .withQuery(eventsQuery)
      .withCallback(eventsCb)
      .build();

    if (user) {
      riakWrapper.queryClient.execute(eventsCmd);
    } else {
      throw new Error('user not found');
    }
  }
);
export const toHumanDateTime = (date: Date) => {
  let month = (date.getMonth() + 1).toString();

  let newDateArray = date.toDateString().split(' ');
  // delete the day name
  newDateArray.splice(0, 1);
  // change the month name to month numbers
  newDateArray.splice(0, 1, month);
  // monve the month to the center
  monveInArray(newDateArray, 0, 1);
  let newDate = newDateArray.join(' ').replace(/\ /g, '/');
  let newTime = date.toTimeString().split(' ')[0];

  return `${newDate} ${newTime}`;
};

const monveInArray = (arr: string[], from: number, to: number): void => {
  let item = arr.splice(from, 1);

  arr.splice(to, 0, item[0]);
};
