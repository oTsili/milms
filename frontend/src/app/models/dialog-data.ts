import { AbstractControl } from '@angular/forms';
import { User } from './auth-data.model';

export interface DialogData {
  id?: string;
  // assignments?: Assignment[];
  title: string;
  description: string;
  semester: string;
  year: string;
  lastUpdate: string;
  instructorId?: string | User;
  instructor?: string;
  currentControl?: AbstractControl;
  rank?: number;
}
