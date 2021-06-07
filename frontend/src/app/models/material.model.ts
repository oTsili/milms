export interface Material {
  name: string;
  id?: string;
  filePath: File | string;
  fileType: string;
  lastUpdate: string;
  assignmentId?: string;
  courseId?: string;
  creatorId?: string;
}
