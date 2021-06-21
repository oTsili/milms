import { Subjects } from '../base/subjects';

export interface CourseMaterialsCreatedEvent {
  subject: Subjects.CourseMaterialCreated;
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
