import nats from 'node-nats-streaming';
import { AssignmentCreatedPublisher } from './events/assignment-created.publisher';
import { catchAsync } from '../../common/src/middlewares/catchAsync';

console.clear();

const stan = nats.connect('milms', 'abc', {
  url: 'http://localhost:4222',
});

stan.on(
  'connect',
  catchAsync(async () => {
    console.log('Publisher connected to NATS');

    const publisher = new AssignmentCreatedPublisher(stan);

    await publisher.publish({
      id: '123',
      title: 'concert',
      description: 'Some description',
      userId: 'dfdfdf',
    });

    // const data = JSON.stringify({
    //   id: '123',
    //   title: 'concert',
    //   price: 20,
    // });

    // stan.publish('ticket:created', data, () => {
    //   console.log('Event published');
    // });
  })
);
