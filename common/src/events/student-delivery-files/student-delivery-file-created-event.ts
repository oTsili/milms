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
    user: string;
    email: string;
    filePath: string;
    fileType: string;
    time: Date;
  };
}
