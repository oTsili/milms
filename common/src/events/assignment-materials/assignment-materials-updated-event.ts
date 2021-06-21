import { Subjects } from '../base/subjects';

export interface AssignmentMaterialsUpdatedEvent {
  subject: Subjects.AssignmentMaterialUpdated;
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
