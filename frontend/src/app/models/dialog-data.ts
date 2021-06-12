import { User } from "./auth-data.model";

export interface DialogData {
  id?: string;
  // assignments?: Assignment[];
  title: string;
  description: string;
  semester: string;
  year: string;
  createdAt: string;
  instructorId?: string | User;
  instructor?: string;
}
