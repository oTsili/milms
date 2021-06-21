import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { ThemePalette } from '@angular/material/core';
import { Assignment } from './assignment.model';
import { User } from 'src/app/models/auth-data.model';

export interface Course {
  id?: string;
  // assignments?: Assignment[];
  title: string;
  description: string;
  semester: string;
  year: string;
  lastUpdate: string;
  instructorId?: string | User;
  instructor?: string;
  position?: number;
}

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

export interface Year {
  value: string;
  viewValue: string;
}
