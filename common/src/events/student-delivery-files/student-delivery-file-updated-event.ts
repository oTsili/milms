import { Subjects } from '../base/subjects';

export interface StudentDeliveryFileUpdatedEvent {
  subject: Subjects.StudentDeliveryFileUpdated;
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
