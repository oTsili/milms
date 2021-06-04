import { Message } from 'node-nats-streaming';
import { Subjects, Listener, AssignmentCreatedEvent } from '@otmilms/common';
import { Assignment } from '../../../models/models';

export class AssignmentCreateListener extends Listener<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
  queueGroupName = 'assignment-create';

  async onMessage(data: AssignmentCreatedEvent['data'], msg: Message) {
    const { id, title, description, lastUpdate, 
      // rank
     } = data;

    const assignment = Assignment.build({
      id,
      title,
      description,
      lastUpdate,
      // rank,
    });

    await assignment.save();

    msg.ack();
  }
}
