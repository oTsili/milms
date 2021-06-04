import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { AssignmentCreatedEvent } from './assignment-created-event';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
  queueGroupName = 'payments-service';

  onMessage(data: AssignmentCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}
