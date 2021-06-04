import { Subjects } from './subjects';

export interface AssignmentCreatedEvent {
  subject: Subjects.AssignmentCreated;
  data: {
    id: string;
    title: string;
    description: string;
    lastUpdate: string;
    rank: number;
  };
}
