import { Subjects } from '../base/subjects';

export interface StudentDeliveryFileDeletedEvent {
  subject: Subjects.StudentDeliveryFileDeleted;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    courseId: string;
    assignmentId: string;
    studentDeliveryAssignmentId: string;
    studentId: string;
    time: Date;
  };
}
