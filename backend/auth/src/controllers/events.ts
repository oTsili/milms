const Riak = require('basho-riak-client');
import { riakWrapper } from '../riak-wrapper';
import { Request, Response, NextFunction } from 'express';
import { catchAsync, BadRequestError, UserPayload } from '@otmilms/common';
import { User } from '../models/models';
import { toHumanDateTime } from './shared';

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
