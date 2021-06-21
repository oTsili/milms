import { Subjects } from '../base/subjects';

export interface CourseMaterialsDeletedEvent {
  subject: Subjects.CourseMaterialDeleted;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    courseId: string;
    creatorId: string;
    user: string;
    email: string;
    filePath: string;
    fileType: string;
    time: Date;
  };
}
