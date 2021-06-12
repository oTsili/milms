import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormControl,
  FormArray,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { StudentDeliveriesService } from '../student-deliveries.service';
import { AssignmentsService } from '../../../assignment.service';
import {
  StudentDeliveryAssignment,
  StudentDeliveryFile,
} from '../../../../../models/student-delivery.model';

@Component({
  selector: 'app-my-student-delivery-list',
  templateUrl: './my-student-delivery-list.component.html',
  styleUrls: ['./my-student-delivery-list.component.css'],
})
export class MyStudentDeliveryListComponent implements OnInit, OnDestroy {
  @Input() assingnmentIndex: number;
  private assignmentIdUpdateSub: Subscription;
  private deliveryUpdateSub: Subscription;
  assignmentsForm: FormGroup;
  currentAssignmentControl: FormControl;
  studentDeliveryFiles: StudentDeliveryFile[];
  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;

  constructor(
    private controlContainer: ControlContainer,
    private assignmentsService: AssignmentsService,
    private studentDeliveriesService: StudentDeliveriesService
  ) {}

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

    this.deliveryUpdateSub = this.studentDeliveriesService
      .getStudentDeliveriesListener()
      .subscribe((studentDeliveryFiles) => {
        console.log('deliveries updated!!!!!!!!!!!!!!!!!!!');

        console.log(studentDeliveryFiles);
        this.studentDeliveryFiles = studentDeliveryFiles;

        console.log(this.studentDeliveryFiles);
      });

    // save the courseId and the assignmentId from the parent component assignmentForm
    this.courseId = this.currentAssignmentControl.value.courseId;
    this.assignmentId = this.currentAssignmentControl.value.id;

    this.currentAssignmentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${this.assingnmentIndex}`) as FormControl;

    // if assignment hasn't saved on the db and thus does not have id throw an error
    if (!this.assignmentId) {
      console.log('Please save the assignment first!');
      // this.sharedService.throwError('Please save the assignment first!');

      return;
    }

    // fetch the student deliveries
    this.studentDeliveriesService
      .getMyStudentDeliveryFiles(this.courseId, this.assignmentId)
      .subscribe((response) => {
        if (response) {
          this.studentDeliveryFiles = response.studentDeliveryFiles;
        }
        console.log(this.studentDeliveryFiles);
      });
  }

  ngOnDestroy() {
    this.assignmentIdUpdateSub.unsubscribe();
    this.deliveryUpdateSub.unsubscribe();
  }

  // deletes a material with regard it's index
  onDeleteStudentDeliveryFile(
    studentDeliveryFile: StudentDeliveryFile,
    studentDeliveryFileIndex: number
  ) {
    const courseId = this.currentAssignmentControl.value.courseId;
    const assignmentId = this.currentAssignmentControl.value.id;

    this.isLoading = true;
    this.studentDeliveriesService
      .deleteStudentDeliveryFile(courseId, assignmentId, studentDeliveryFile)
      .subscribe(
        (response) => {
          this.studentDeliveryFiles.splice(studentDeliveryFileIndex, 1);

          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  ondDownloadStudentDeliveryFile(studentDeliveryFile: StudentDeliveryFile) {
    this.isLoading = true;

    const courseId = this.currentAssignmentControl.value.courseId;
    const assignmentId = this.currentAssignmentControl.value.id;

    this.studentDeliveriesService
      .downloadStudentDeliveryFile(courseId, assignmentId, studentDeliveryFile)
      .subscribe((response: Blob) => {
        saveAs(response, studentDeliveryFile.name);
        this.isLoading = false;
      });
  }
}