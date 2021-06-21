import { Subjects } from '../base/subjects';

export interface CourseUpdatedEvent {
  subject: Subjects.CourseUpdated;
  data: {
    id: string;
    title: string;
    description: string;
    semester: string;
    year: string;
    lastUpdate: Date;
    instructorId: string;
    user: string;
    email: string;
    time: Date;
  };
}
