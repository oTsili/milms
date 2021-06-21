import { Subjects } from '../base/subjects';

export interface StudentDeliveryAssignmentDeletedEvent {
  subject: Subjects.StudentDeliveryAssignmentDeleted;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    studentId: string;
    courseId: string;
    assignmentId: string;
    instructorId: string;
    studentName: string;
    user: string;
    email: string;
    time: Date;
  };
}
