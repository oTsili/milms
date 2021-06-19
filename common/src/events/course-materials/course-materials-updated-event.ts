import { Subjects } from '../base/subjects';

export interface CourseMaterialsUpdatedEvent {
  subject: Subjects.CourseMaterialUpdated;
  data: {
    id: string;
    name: string;
    lastUpdate: Date;
    courseId: string;
    creatorId: string;
    time: Date;
  };
}
