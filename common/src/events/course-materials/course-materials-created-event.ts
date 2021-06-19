import { Subjects } from '../base/subjects';

export interface CourseMaterialsCreatedEvent {
  subject: Subjects.CourseMaterialCreated;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    courseId: string;
    creatorId: string;
    time: Date;
  };
}
