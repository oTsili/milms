import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import {
  FormGroup,
  FormControl,
  ControlContainer,
  FormArray,
} from '@angular/forms';
import { StudentDeliveryFile } from 'src/app/models/student-delivery.model';
import { AssignmentsService } from '../../../assignment.service';
import { StudentDeliveriesService } from '../student-deliveries.service';
import { TableDelivery } from 'src/app/models/student-delivery.model';
import { Sort } from '@angular/material/sort';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-all-student-deliveries-list',
  styleUrls: ['./all-student-deliveries-list.component.css'],
  templateUrl: './all-student-deliveries-list.component.html',
})
export class AllStudentDeliveriesListComponent implements OnInit, OnDestroy {
  @Input() assingnmentIndex: number;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = [
    'position',
    'studentName',
    'assignmentName',
    'deliveryName',
    'lastUpdate',
    'rank',
  ];
  private assignmentIdUpdateSub: Subscription;
  private deliveryUpdateSub: Subscription;
  assignmentsForm: FormGroup;
  currentAssignmentControl: FormControl;
  studentDeliveryFiles: TableDelivery[];
  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;
  dataSource;

  constructor(
    private controlContainer: ControlContainer,
    private assignmentsService: AssignmentsService,
    private studentDeliveriesService: StudentDeliveriesService
  ) {}

  // ngAfterViewInit() {
  //   this.dataSource.sort = this.sort;
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

    this.deliveryUpdateSub = this.studentDeliveriesService
      .getTableStudentDeliveries()
      .subscribe((studentDeliveryFiles) => {
        console.log('deliveries updated!!!!!!!!!!!!!!!!!!!');

        this.studentDeliveryFiles = studentDeliveryFiles;
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
      .getAllStudentDeliveryFiles(this.courseId, this.assignmentId)
      .subscribe((response) => {
        if (response) {
          this.studentDeliveryFiles = response.studentDeliveryFiles;
          this.dataSource = new MatTableDataSource(this.studentDeliveryFiles);

          this.studentDeliveriesService.onStudentDeliveriesUpdate(
            this.studentDeliveryFiles
          );
        }
      });
  }

  ngOnDestroy() {
    this.assignmentIdUpdateSub.unsubscribe();
    this.deliveryUpdateSub.unsubscribe();
  }

  ondDownloadStudentDeliveryFile(studentDeliveryFile: StudentDeliveryFile) {
    this.isLoading = true;

    this.studentDeliveriesService
      .downloadStudentDeliveryFile(
        this.courseId,
        this.assignmentId,
        studentDeliveryFile
      )
      .subscribe((response: Blob) => {
        saveAs(response, studentDeliveryFile.name);
        this.isLoading = false;
      });
  }

  // downloads the specific file/assignment
  onDownloadAssignment(): void {
    let fileName = this.currentAssignmentControl.value.filePath
      .split('/')
      .slice(-1)
      .pop();

    this.assignmentsService
      .downloadAssignment(fileName, this.currentAssignmentControl.value)
      .subscribe((response: Blob) => {
        saveAs(response, fileName);
        this.isLoading = false;
      });
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.studentDeliveryFiles = this.studentDeliveryFiles.slice();
      return;
    }

    this.isLoading = true;
    this.studentDeliveriesService
      .getAllStudentDeliveryFiles(
        this.courseId,
        this.assignmentId,
        JSON.stringify(sort)
      )
      .subscribe((fetchedDeliveries) => {
        this.studentDeliveryFiles = fetchedDeliveries.studentDeliveryFiles;
        // this.clearFormArray(this.assignmentControls);
        // for (let i = 0; i < this.assignments.length; i++) {
        //   this.addItem(this.assignments[i]);
        // }
        this.isLoading = false;
      });
  }

  // // removes all the values controls of the formArray
  // clearFormArray(formArray: FormArray) {
  //   if (formArray) {
  //     while (formArray.length !== 0) {
  //       formArray.removeAt(0);
  //     }
  //   }
  // }
}
