import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { StudentDeliveriesService } from './student-delivery.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StudentDeliveryFile } from 'src/app/models/student-delivery.model';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-student-delivery-list',
  templateUrl: './student-deliveries-list.component.html',
  styleUrls: ['./student-deliveries-list.component.css'],
})
export class StudentDeliveryListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'name', 'lastUpdate', 'options'];

  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;
  dataSource;
  studentDeliveries: StudentDeliveryFile[];
  studentDeliveryUpdateSubscription: Subscription;
  totalStudentDeliveries = environment.TOTAL_COURSES;
  studentDeliveriesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  constructor(
    // private controlContainer: ControlContainer,
    public route: ActivatedRoute,
    private studentDeliveriesService: StudentDeliveriesService
  ) {}
  ngOnInit() {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId') && paraMap.has('assignmentId')) {
        this.courseId = paraMap.get('courseId');
        this.assignmentId = paraMap.get('assignmentId');
      } else {
        // throw new Error('no course id provided');
        console.log('no assignment id or course id provided');
      }
    });

    this.studentDeliveryUpdateSubscription = this.studentDeliveriesService
      .getStudentDeliverieslListener()
      .subscribe((response) => {
        this.studentDeliveriesService
          .getStudentDeliveries(
            this.studentDeliveriesPerPage,
            this.currentPage,
            this.courseId,
            this.assignmentId
          )
          .subscribe((response) => {
            this.studentDeliveries = response.studentDeliveries;
            this.totalStudentDeliveries = response.maxStudentDeliveries;
            this.dataSource = new MatTableDataSource(this.studentDeliveries);
          });
      });

    // fetch the materials
    this.studentDeliveriesService
      .getStudentDeliveries(
        this.studentDeliveriesPerPage,
        this.currentPage,
        this.courseId,
        this.assignmentId
      )
      .subscribe((response) => {
        console.log(response);

        this.studentDeliveries = response.studentDeliveries;
        this.totalStudentDeliveries = response.maxStudentDeliveries;
        this.dataSource = new MatTableDataSource(this.studentDeliveries);
        console.log(this.studentDeliveries);
      });
  }
  ngOnDestroy() {
    // this.assignmentIdUpdateSub.unsubscribe();
    this.studentDeliveryUpdateSubscription.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.studentDeliveries = this.studentDeliveries.slice();
      return;
    }

    this.isLoading = true;
    this.studentDeliveriesService
      .getStudentDeliveries(
        this.studentDeliveriesPerPage,
        this.currentPage,
        this.courseId,
        this.assignmentId,
        sort
      )
      .subscribe((response) => {
        this.studentDeliveries = response.studentDeliveries;
        // this.clearFormArray(this.assignmentControls);
        // for (let i = 0; i < this.assignments.length; i++) {
        //   this.addItem(this.assignments[i]);
        // }
        this.isLoading = false;
      });
  }

  // deletes a material with regard it's index
  onDeleteStudentDelivery(
    studentDelivery: StudentDeliveryFile,
    studentDeliveryIndex: number
  ) {
    console.log('studentDelivery: ', studentDelivery);

    // this.currentAssignmentControl = (
    //   this.assignmentsForm.get('assignmentsFormArray') as FormArray
    // ).get(`${this.assingnmentIndex}`) as FormControl;

    this.isLoading = true;
    this.studentDeliveriesService
      .deleteStudentDelivery(studentDelivery)
      .subscribe(
        (response) => {
          console.log('response: ', response);
          console.log(this.studentDeliveries);
          this.studentDeliveries.splice(studentDeliveryIndex, 1);
          console.log(this.studentDeliveries);
          this.dataSource = new MatTableDataSource(this.studentDeliveries);
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  ondDownloadAssignmentMaterial(studentDelivery: StudentDeliveryFile) {
    this.isLoading = true;
    this.studentDeliveriesService
      .downloadStudentDelivery(studentDelivery)
      .subscribe((response: Blob) => {
        saveAs(response, studentDelivery.name);
        this.isLoading = false;
      });
  }
}
