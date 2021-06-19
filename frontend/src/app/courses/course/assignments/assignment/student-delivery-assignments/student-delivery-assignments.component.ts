import { Component, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { StudentDeliveryAssignment } from 'src/app/models/student-delivery.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { StudentDeliveryAssignmentService } from './student-delivery-assignments.service';
import { MatTableDataSource } from '@angular/material/table';
import { Sort, MatSort } from '@angular/material/sort';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RankTableLineomponent } from 'src/app/shared/matDialog/rankTableLine/rankTableLine.component';
@Component({
  selector: 'app-student-delivery-assignments',
  templateUrl: './student-delivery-assignments.component.html',
  styleUrls: ['./student-delivery-assignments.component.css'],
})
export class StudentDeliveryAssignmentsComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @Input() displayedColumns: string[];
  @Input() userRole: string;
  dataSource: MatTableDataSource<StudentDeliveryAssignment>;
  emptyStudentDeliveryAssignment: StudentDeliveryAssignment = {
    id: null,
    position: null,
    name: null,
    lastUpdate: null,
    rank: null,
    studentId: null,
    courseId: null,
    assignmentId: null,
    instructorId: null,
    studentName: null,
  };
  userRoleSubscription: Subscription;
  studentDeliveryAssignmentUpdateSubscription: Subscription;
  courseId: string;
  assignmentId: string;
  // userRole: string;
  mode: string;
  isLoading: boolean = false;
  studentDeliveryAssignmentsControls: FormArray;
  studentDeliveryAssignmentsForm: FormGroup;
  totalStudentDeliveryAssignments: number;
  pageSizeOptions = environment.PAGE_SIZE_OPTIONS;
  studentDeliveryAssignments: StudentDeliveryAssignment[];
  totalStudentDeliveries = environment.TOTAL_COURSES;
  studentDeliveryAssignmentsPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    private formBuilder: FormBuilder,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private studentDeliveryAssignmentService: StudentDeliveryAssignmentService,
    public dialog: MatDialog
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

    this.sharedService.getUserRole().subscribe((response) => {
      this.userRole = response.userRole;
    });

    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        this.userRole = response;
      });

    this.initializeControls();

    this.studentDeliveryAssignmentUpdateSubscription =
      this.studentDeliveryAssignmentService
        .getStudentDeliveryAssignmentsListener()
        .subscribe((response) => {
          // fetch the deliveries from the db. Local are incomplete
          this.studentDeliveryAssignmentService
            .getStudentDeliveryAssignments(
              this.studentDeliveryAssignmentsPerPage,
              this.currentPage,
              this.courseId,
              this.assignmentId
            )
            .subscribe((response) => {
              this.studentDeliveryAssignments = response.studentDeliveries;
              this.totalStudentDeliveries = response.maxStudentDeliveries;

              if (this.totalStudentDeliveries > 0) {
                for (let delivery of this.studentDeliveryAssignments) {
                  this.addItem(delivery);
                }
              }
              this.dataSource = new MatTableDataSource(
                this.studentDeliveryAssignments
              );
            });
        });

    // fetch the materials
    this.studentDeliveryAssignmentService
      .getStudentDeliveryAssignments(
        this.studentDeliveryAssignmentsPerPage,
        this.currentPage,
        this.courseId,
        this.assignmentId
      )
      .subscribe((response) => {
        this.studentDeliveryAssignments = response.studentDeliveries;
        this.totalStudentDeliveries = response.maxStudentDeliveries;

        if (this.totalStudentDeliveries > 0) {
          for (let delivery of this.studentDeliveryAssignments) {
            this.addItem(delivery);
          }
        }

        this.dataSource = new MatTableDataSource(
          this.studentDeliveryAssignments
        );
      });

    this.studentDeliveryAssignmentsControls =
      this.studentDeliveryAssignmentsForm.get(
        'studentDeliveryAssignmentsFormArray'
      ) as FormArray;
  }
  ngOnDestroy() {
    this.studentDeliveryAssignmentUpdateSubscription.unsubscribe();
    this.userRoleSubscription.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.studentDeliveryAssignments = this.studentDeliveryAssignments.slice();
      return;
    }

    this.isLoading = true;
    this.studentDeliveryAssignmentService
      .getStudentDeliveryAssignments(
        this.studentDeliveryAssignmentsPerPage,
        this.currentPage,
        this.courseId,
        this.assignmentId,
        sort
      )
      .subscribe((response) => {
        this.studentDeliveryAssignmentService
          .getStudentDeliveryAssignments(
            this.studentDeliveryAssignmentsPerPage,
            this.currentPage,
            this.courseId,
            this.assignmentId
          )
          .subscribe((response) => {
            this.studentDeliveryAssignments = response.studentDeliveries;
            this.totalStudentDeliveries = response.maxStudentDeliveries;
            this.dataSource = new MatTableDataSource(
              this.studentDeliveryAssignments
            );
          });
        this.isLoading = false;
      });
  }

  openDialog(controlIndex: number): void {
    let currentControl = this.studentDeliveryAssignmentsControls.get(
      `${controlIndex}`
    );

    let dialogRef: MatDialogRef<RankTableLineomponent, any>;

    dialogRef = this.dialog.open(RankTableLineomponent, {
      width: '350px',
      data: {
        rank: currentControl.value.rank || null,
      },
    });

    // on clicking save to the dialog
    dialogRef.afterClosed().subscribe((dialogInput) => {
      let formIsInvalid: boolean = true;

      if (dialogInput) {
        const { rank } = dialogInput;
        const resultArray = [rank];
        formIsInvalid = resultArray.some(
          (item) => item === undefined || item === null
        );
      }

      if (formIsInvalid || !dialogInput) {
        this.sharedService.throwError('Invalid input!');
        return;
      }

      this.saveStudentDeliveryAssignment(
        this.studentDeliveryAssignmentsControls.length,
        dialogInput,
        controlIndex
      );
    });
  }

  initializeControls() {
    // define and initialize the form group and formArray
    this.studentDeliveryAssignmentsForm = this.formBuilder.group({
      studentDeliveryAssignmentsFormArray: this.formBuilder.array([]),
    });
  }

  // saves the new course to the db
  saveStudentDeliveryAssignment(
    controlsLength: number,
    studentDeliveryAssignmentInput: StudentDeliveryAssignment,
    controlIndex: number
  ): void | boolean {
    this.addItem(studentDeliveryAssignmentInput);

    let newControl = this.studentDeliveryAssignmentsControls.get(
      `${controlsLength}`
    );

    if (!this.formIsValid(newControl)) {
      console.log('Invalid form');
      return;
    }

    this.updateStudentDeliveryAssignment(
      studentDeliveryAssignmentInput,
      controlIndex
    );
  }

  // updates a specific control
  updateStudentDeliveryAssignment(
    currentStudentDeliveryAssignment: StudentDeliveryAssignment,
    studentDeliveryAssignmentIndex: number
  ) {
    currentStudentDeliveryAssignment.id =
      this.studentDeliveryAssignmentsControls.get(
        `${studentDeliveryAssignmentIndex}`
      ).value.id;

    currentStudentDeliveryAssignment.courseId = this.courseId;
    currentStudentDeliveryAssignment.assignmentId = this.assignmentId;

    this.studentDeliveryAssignmentService
      .onUpdateStudentDeliveryAssignment(currentStudentDeliveryAssignment)
      .subscribe(
        (response) => {
          this.studentDeliveryAssignmentService
            .getStudentDeliveryAssignments(
              this.studentDeliveryAssignmentsPerPage,
              this.currentPage,
              this.courseId,
              this.assignmentId
            )
            .subscribe((fetchedStudentDeliveryAssignments) => {
              this.studentDeliveryAssignments =
                fetchedStudentDeliveryAssignments.studentDeliveries;
              this.totalStudentDeliveryAssignments =
                fetchedStudentDeliveryAssignments.maxStudentDeliveries;

              // remove from the formArray
              this.studentDeliveryAssignmentsControls.removeAt(
                studentDeliveryAssignmentIndex
              );

              // update the table
              this.dataSource = new MatTableDataSource(
                this.studentDeliveryAssignments
              );

              this.isLoading = false;
            });
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  // adds a control in the controlArray
  addItem(
    item: StudentDeliveryAssignment = this.emptyStudentDeliveryAssignment
  ): void {
    this.studentDeliveryAssignmentsControls.push(this.createItem(item));
    this.studentDeliveryAssignmentsControls.updateValueAndValidity();
  }

  // check specific controls, to be regarded valid
  formIsValid = (newControl: AbstractControl): boolean => {
    if (newControl.get('rank').valid) {
      return true;
    }

    return false;
  };

  // initialize a form control
  createItem(item: StudentDeliveryAssignment): FormGroup {
    return this.formBuilder.group({
      id: [item.id, Validators.required],
      position: [item.position, Validators.required],
      name: [item.name, Validators.required],
      lastUpdate: [item.lastUpdate, Validators.required],
      rank: [item.rank, Validators.required],
      studentId: [item.studentId, Validators.required],
      courseId: [item.courseId, Validators.required],
      assignmentId: [item.assignmentId, Validators.required],
      instructorId: [item.instructorId, Validators.required],
      studentName: [item.studentName, Validators.required],
    });
  }
}
