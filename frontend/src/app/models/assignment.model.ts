import { StudentDeliveryAssignment } from './student-delivery.model';
import { Course } from './course.model';
import { Material } from './material.model';

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
  materials?: Material[] | File[] | FileList;
}
