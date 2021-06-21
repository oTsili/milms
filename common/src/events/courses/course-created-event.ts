import { Subjects } from '../base/subjects';

export interface CourseCreatedEvent {
  subject: Subjects.CourseCreated;
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
