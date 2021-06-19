import { Subjects } from '../base/subjects';

export interface CourseDeletedEvent {
  subject: Subjects.CourseDeleted;
  data: {
    id: string;
    title: string;
    description: string;
    semester: string;
    year: string;
    createdAt: Date;
    instructorId: string;
    time: Date;
  };
}
