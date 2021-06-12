import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AssignmentListComponent } from './assignment-list/assignment-list.component';
import { AngularMaterialModule } from '../../angular-material.module';
import { DragAndDropModule } from '../../shared/dragAndDrop/dragAndDrop.module';
import { MaterialListComponent } from './assignment-list/material-list/material-list.component';
import { MyStudentDeliveryListComponent } from './assignment-list/student-deliveries/my-student-delivery-list/my-student-delivery-list.component';
import { AllStudentDeliveriesListComponent } from './assignment-list/student-deliveries/all-student-deliveries-list/all-student-deliveries-list.component';

@NgModule({
  declarations: [
    AssignmentListComponent,
    MaterialListComponent,
    MyStudentDeliveryListComponent,
    AllStudentDeliveriesListComponent,
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
export class AssignmentsModule {}
