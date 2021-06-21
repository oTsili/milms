import { Subjects } from '../base/subjects';

export interface AssignmentMaterialsDeletedEvent {
  subject: Subjects.AssignmentMaterialDeleted;
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
