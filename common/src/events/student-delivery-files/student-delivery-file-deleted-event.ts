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
    user: string;
    email: string;
    filePath: string;
    fileType: string;
    time: Date;
  };
}
