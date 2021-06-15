import { Course } from './course.model';
import { User } from './auth-data.model';

export interface Assignment {
  position?: number;
  title: string;
  id?: string;
  description: string;
  filePath: File | string;
  fileType: string;
  lastUpdate: string;
  instructorId?: string | User;
  rank?: number;
  courseId: string | Course;
}
