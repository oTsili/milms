import { Course } from './course.model';

export interface Assignment {
  title: string;
  id?: string;
  description: string;
  filePath: File | string;
  fileType: string;
  lastUpdate: string;
  userName?: string;
  rank?: number;
  courseId: string | Course;
}
