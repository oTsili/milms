import { Publisher, Subjects, AssignmentCreatedEvent } from '@otmilms/common';

export class AssignmentCreatedPublisher extends Publisher<AssignmentCreatedEvent> {
  readonly subject = Subjects.AssignmentCreated;
}
