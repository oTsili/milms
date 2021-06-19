import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { StudentDeliveriesService } from './student-delivery.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StudentDeliveryFile } from 'src/app/models/student-delivery.model';
import { MatTableDataSource } from '@angular/material/table';
import { Sort, MatSort } from '@angular/material/sort';
import { SharedService } from 'src/app/shared/services/shared.service';
@Component({
  selector: 'app-student-delivery-files',
  templateUrl: './student-delivery-files.component.html',
  styleUrls: ['./student-delivery-files.component.css'],
})
export class StudentDeliveryFilesComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @Input() displayedColumns: string;
  @Input() user_role: string;
  userRoleSubscription: Subscription;
  studentDeliveryUpdateSubscription: Subscription;
  courseId: string;
  assignmentId: string;
  isLoading: boolean = false;
  // userRole: string;
  dataSource: MatTableDataSource<StudentDeliveryFile>;
  studentDeliveries: StudentDeliveryFile[];
  totalStudentDeliveries = environment.TOTAL_COURSES;
  studentDeliveriesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  constructor(
    // private controlContainer: ControlContainer,
    public route: ActivatedRoute,
    private studentDeliveriesService: StudentDeliveriesService,
    private sharedService: SharedService
  ) {}
  ngOnInit() {
    console.log(this.dataSource);
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId') && paraMap.has('assignmentId')) {
        this.courseId = paraMap.get('courseId');
        this.assignmentId = paraMap.get('assignmentId');
      } else {
        // throw new Error('no course id provided');
        console.log('no assignment id or course id provided');
      }
    });

    this.sharedService.getUserRole().subscribe((response) => {
      this.user_role = response.userRole;
    });

    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        this.user_role = response;
      });

    this.studentDeliveryUpdateSubscription = this.studentDeliveriesService
      .getStudentDeliverieslListener()
      .subscribe((response) => {
        // fetch the deliveries from the db. Local are incomplete
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
        this.studentDeliveries = response.studentDeliveries;
        this.totalStudentDeliveries = response.maxStudentDeliveries;
        this.dataSource = new MatTableDataSource(this.studentDeliveries);
      });
  }
  ngOnDestroy() {
    this.studentDeliveryUpdateSubscription.unsubscribe();
    this.userRoleSubscription.unsubscribe();
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
        this.isLoading = false;
      });
  }

  // deletes a material with regard it's index
  onDeleteStudentDelivery(
    studentDelivery: StudentDeliveryFile,
    studentDeliveryIndex: number
  ) {
    // this.currentAssignmentControl = (
    //   this.assignmentsForm.get('assignmentsFormArray') as FormArray
    // ).get(`${this.assingnmentIndex}`) as FormControl;

    this.isLoading = true;
    this.studentDeliveriesService
      .deleteStudentDelivery(studentDelivery)
      .subscribe(
        (response) => {
          // fetch the materials
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
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  ondDownloadStudentDelivery(studentDelivery: StudentDeliveryFile) {
    this.isLoading = true;
    this.studentDeliveriesService
      .downloadStudentDelivery(studentDelivery)
      .subscribe((response: Blob) => {
        saveAs(response, studentDelivery.name);
        this.isLoading = false;
      });
  }
}
