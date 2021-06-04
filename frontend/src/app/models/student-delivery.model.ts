import { Course } from './course.model';
import { User } from './auth-data.model';
import { Assignment } from './assignment.model';

export interface StudentDeliveryAssignment {
  id?: string;
  name: string;
  lastUpdate?: string;
  rank?: number;
  studentId?: User | string;
  courseId?: Course | string;
  assignmentId?: Assignment | string;
  instructorId?: User | string;
  studentName?: string;
  comment?: string;
  children?: StudentDeliveryAssignment[];
}

export interface StudentDeliveryFile {
  id?: string;
  name: string;
  expandable?: boolean;
  level?: number;
  lastUpdate?: string;
  filePath?: string | File;
  fileType?: string;
  assignmentId?: string | Assignment;
  studentDeliveryAssignmentId?: string | StudentDeliveryAssignment;
  studentId?: string | User;
}
