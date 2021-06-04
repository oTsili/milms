import { Publisher } from './base-publisher';
import { AssignmentCreatedEvent } from './assignment-created-event';
import { Subjects } from './subjects';

export class AssignmentCreatedPublisher extends Publisher<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
}
