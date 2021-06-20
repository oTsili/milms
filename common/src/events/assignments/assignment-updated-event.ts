import { Subjects } from './../base/subjects';

export interface AssignmentUpdatedEvent {
  subject: Subjects.AssignmentUpdated;
  data: {
    id: string;
    title: string;
    description: string;
    lastUpdate: Date;
    time: Date;
  };
}
