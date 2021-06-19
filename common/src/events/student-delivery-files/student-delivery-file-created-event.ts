import { Subjects } from '../base/subjects';

export interface StudentDeliveryFileCreatedEvent {
  subject: Subjects.StudentDeliveryFileCreated;
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
