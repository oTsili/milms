import { Subjects } from './../base/subjects';

export interface AssignmentCreatedEvent {
  subject: Subjects.AssignmentCreated;
  data: {
    id: string;
    title: string;
    description: string;
    lastUpdate: Date;
    user: string;
    email: string;
    time: Date;
  };
}
