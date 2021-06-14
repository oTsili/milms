import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AngularMaterialModule } from 'src/app/angular-material.module';
import { DragAndDropModule } from 'src/app/shared/dragAndDrop/dragAndDrop.module';
import { StudentCoursesComponent } from 'src/app/courses/student-courses/student-courses.component';
import { InstructorCoursesComponent } from 'src/app/courses/instructor-courses/instructor-courses.component';
import { CoursesComponent } from './courses.component';

@NgModule({
  declarations: [
    CoursesComponent,
    StudentCoursesComponent,
    InstructorCoursesComponent,
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    CommonModule,
    RouterModule,
    DragAndDropModule,
  ],
})
export class CoursesModule {}
