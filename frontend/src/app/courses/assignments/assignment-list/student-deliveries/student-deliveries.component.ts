import {
  ControlContainer,
  FormGroup,
  FormArray,
  FormControl,
} from '@angular/forms';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Subscription } from 'rxjs';

import {
  StudentDeliveryAssignment,
  StudentDeliveryFile,
} from 'src/app/models/student-delivery.model';
import { Assignment } from '../../../../models/assignment.model';
import { AssignmentsService } from '../../assignment.service';
import { StudentDeliveriesService } from './student-deliveries.service';

@Component({
  selector: 'app-student-deliveries',
  templateUrl: './student-deliveries.component.html',
  styleUrls: ['./student-deliveries.component.css'],
})
export class StudentDeliveriesComponent implements OnInit, OnDestroy {
  @Input() assingnmentIndex: number;
  private assignmentIdUpdateSub: Subscription;
  studentDeliveries: StudentDeliveryAssignment[];

  assignmentsForm: FormGroup;
  currentAssignmentControl: FormControl;
  courseId: string;
  assignmentId: string;
  constructor(
    private controlContainer: ControlContainer,
    private assignmentsService: AssignmentsService,
    private studentDeliveriesService: StudentDeliveriesService
  ) {
    // this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {
    this.assignmentsForm = <FormGroup>this.controlContainer.control;

    this.currentAssignmentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${this.assingnmentIndex}`) as FormControl;

    // define custom subscriptions
    this.assignmentIdUpdateSub = this.assignmentsService
      .getAssignmentIdListener()
      .subscribe((assignmentId) => {
        this.assignmentId = assignmentId;
      });

    // save the courseId and the assignmentId from the parent component assignmentForm
    this.courseId = this.currentAssignmentControl.value.courseId;
    this.assignmentId = this.currentAssignmentControl.value.id;

    // if assignment hasn't saved on the db and thus does not have id throw an error
    if (!this.assignmentId) {
      console.log('Please save the assignment first!');
      // this.sharedService.throwError('Please save the assignment first!');

      return;
    }

    // fetch the materials
    this.studentDeliveriesService
      .getAssignmentStudentDeliveriesFiles(this.courseId, this.assignmentId)
      .subscribe((deliveryResponse) => {
        console.log(deliveryResponse);

        this.studentDeliveries = deliveryResponse.studentDeliveryFiles;
        console.log(this.studentDeliveries);
      });
  }

  ngOnDestroy() {
    this.assignmentIdUpdateSub.unsubscribe();
  }
}
