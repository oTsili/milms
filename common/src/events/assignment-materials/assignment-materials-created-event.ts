import { Subjects } from '../base/subjects';

export interface AssignmentMaterialsCreatedEvent {
  subject: Subjects.AssignmentMaterialCreated;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    courseId: string;
    assignmentId: string;
    creatorId: string;
    user: string;
    email: string;
    time: Date;
  };
}
