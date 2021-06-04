import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import { ThemePalette } from '@angular/material/core';
import { Assignment } from './assignment.model';

export interface Course {
  id?: string;
  assignments?: Assignment[];
  courseTitle: string;
  description: string;
  semester: string;
  year: string;
  createdAt: string;
  instructor: string;
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
