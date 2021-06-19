import { Course } from './course.model';
import { User } from './auth-data.model';
import { Assignment } from './assignment.model';

export interface StudentDeliveryAssignment {
  position?: number;
  id?: string;
  name: string;
  lastUpdate?: string;
  rank?: number;
  studentId?: User | string;
  courseId?: Course | string;
  assignmentId?: Assignment | string;
  instructorId?: User | string;
  studentName?: string;
}

export interface StudentDeliveryFile {
  id?: string;
  name: string;
  expandable?: boolean;
  level?: number;
  lastUpdate?: string;
  filePath?: string | File;
  fileType?: string;
  courseId?: string;
  assignmentId?: string | Assignment;
  studentDeliveryAssignmentId?: string | StudentDeliveryAssignment;
  studentId?: string | User;
}

export interface TableDelivery {
  id: string;
  studentName: string;
  assignmentName: string;
  deliveryName: string;
  lastUpdate: string;
  rank: number;
}
