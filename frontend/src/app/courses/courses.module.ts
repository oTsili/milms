import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AngularMaterialModule } from 'src/app/angular-material.module';
import { DragAndDropModule } from 'src/app/shared/dragAndDrop/dragAndDrop.module';
import { StudentCoursesComponent } from 'src/app/courses/student-courses/student-courses.component';
import { InstructorCoursesComponent } from 'src/app/courses/instructor-courses/instructor-courses.component';
import { CoursesComponent } from 'src/app/courses/courses.component';
import { CourseComponent } from 'src/app/courses/course/course.component';
import { CourseMaterialListComponent } from 'src/app/courses/course/course-material-list/course-material-list.component';
import { StudentAssignmentsComponent } from 'src/app/courses/course/assignments/student-assignments/student-assignments.component';
import { InstructorAssignmentsComponent } from 'src/app/courses/course/assignments/instructor-assignments/instructor-assignments.component';

import { AssignmentComponent } from './course/assignments/assignment/assignment.component';
import { AssignmentMaterialsComponent } from './course/assignments/assignment/assignment-material-list/assignment-material-list.component';
import { StudentDeliveryFilesComponent } from './course/assignments/assignment/student-delivery-files/student-delivery-files.component';
import { StudentDeliveryAssignmentsComponent } from './course/assignments/assignment/student-delivery-assignments/student-delivery-assignments.component';

@NgModule({
  declarations: [
    CoursesComponent,
    CourseComponent,
    StudentCoursesComponent,
    InstructorCoursesComponent,
    CourseMaterialListComponent,
    StudentAssignmentsComponent,
    InstructorAssignmentsComponent,
    AssignmentComponent,
    AssignmentMaterialsComponent,
    StudentDeliveryFilesComponent,
    StudentDeliveryAssignmentsComponent,
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
