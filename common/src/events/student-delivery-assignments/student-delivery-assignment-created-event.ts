import { Subjects } from '../base/subjects';

export interface StudentDeliveryAssignmentCreatedEvent {
  subject: Subjects.StudentDeliveryAssignmentCreated;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    studentId: string;
    courseId: string;
    assignmentId: string;
    instructorId: string;
    studentName: string;
    time: Date;
  };
}
