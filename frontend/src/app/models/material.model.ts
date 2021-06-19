export interface Material {
  position?: number;
  name: string;
  id?: string;
  filePath: File | string;
  fileType: string;
  lastUpdate?: string;
  assignmentId?: string;
  courseId?: string;
  creatorId?: string;
}
