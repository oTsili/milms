import { Subjects } from '../base/subjects';

export interface StudentDeliveryAssignmentUpdatedEvent {
  subject: Subjects.StudentDeliveryAssignmentUpdated;
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
