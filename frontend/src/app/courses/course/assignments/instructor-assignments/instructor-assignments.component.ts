import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

import { CoursesService } from 'src/app/courses/courses.service';
import { HeaderService } from 'src/app/header/header.service';
import { Assignment } from 'src/app/models/assignment.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { AssignmentsService } from 'src/app/courses/course/assignments/assignments.service';
import { AssignmentTableLineComponent } from 'src/app/shared/matDialog/assignmentTableLine/assignmentTableLine.component';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { fileTableLineComponent } from 'src/app/shared/matDialog/fileTableLine/fileTableLine.component';

@Component({
  selector: 'app-instructor-assignments',
  templateUrl: './instructor-assignments.component.html',
  styleUrls: ['./instructor-assignments.component.css'],
})
export class InstructorAssignmentsComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  dataSource;
  displayedColumns: string[] = [
    'position',
    'title',
    'lastUpdate',
    'instructor',
    'options',
  ];
  emptyAssignment: Assignment = {
    id: null,
    position: null,
    title: null,
    description: null,
    lastUpdate: null,
    filePath: null,
    fileType: null,
    courseId: null,
    instructorId: null,
  };

  user: {
    userPhotoPath: string;
    userName: string;
  };
  matPanelStep: boolean[] = [false];
  private assignmentsUpdateSubscription: Subscription;
  private dialogNoButtonClickSubscription: Subscription;
  assignments: Assignment[];
  assignmentControls: FormArray;
  userRole: string;
  mode: string;
  courseId: string;
  assignmentsForm: FormGroup;
  isLoading = false;
  noButtonIsClicked = false;
  pageSizeOptions = environment.PAGE_SIZE_OPTIONS;
  totalAssignments = environment.TOTAL_COURSES;
  assignmentsPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    public route: ActivatedRoute,
    private assignmentsService: AssignmentsService,
    private sharedService: SharedService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // update the null values of the current user to be used in new assignments
    this.user = this.headerService.getUserData();

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else {
        throw new Error('no course id provided');
      }
    });

    // define custom subscriptions
    this.assignmentsUpdateSubscription = this.assignmentsService
      .getAssignmentsListener()
      .subscribe((response) => {
        console.log('assignments updated');
        this.assignments = response.assignments;
        this.totalAssignments = response.maxAssignments;
      });
    this.dialogNoButtonClickSubscription = this.sharedService
      .getNoButtonListener()
      .subscribe((response) => {
        console.log('No button clicked');
        this.noButtonIsClicked = response;
      });

    // define and initialize the form group and formArray
    this.initializeControls();

    // fetch the assignments
    this.assignmentsService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((response) => {
        this.assignments = response.assignments;
        this.totalAssignments = response.maxAssignments;

        if (this.totalAssignments > 0) {
          for (let assignment of this.assignments) {
            this.addItem(assignment);
          }
        }
        this.dataSource = new MatTableDataSource(this.assignments);
        this.isLoading = false;
      });

    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;
  }

  ngOnDestroy(): void {
    this.assignmentsUpdateSubscription.unsubscribe();
    this.dialogNoButtonClickSubscription.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.assignments = this.assignments.slice();
      return;
    }

    this.isLoading = true;
    this.assignmentsService
      .getAssignments(
        this.assignmentsPerPage,
        this.currentPage,
        JSON.stringify(sort)
      )
      .subscribe((response) => {
        // fetch the assignments
        this.assignmentsService
          .getAssignments(
            this.assignmentsPerPage,
            this.currentPage,
            this.courseId
          )
          .subscribe((response) => {
            this.assignments = response.assignments;
            this.totalAssignments = response.maxAssignments;

            if (this.totalAssignments > 0) {
              for (let assignment of this.assignments) {
                this.addItem(assignment);
              }
            }
            this.dataSource = new MatTableDataSource(this.assignments);
            this.isLoading = false;
          });
      });
  }

  openDialog(controlIndex: number, mode: string): void {
    this.mode = mode;
    let currentControl = this.assignmentControls.get(`${controlIndex}`);

    let dialogRef: MatDialogRef<AssignmentTableLineComponent, any>;

    if (this.mode === 'create') {
      //  Add new control
      dialogRef = this.dialog.open(AssignmentTableLineComponent, {
        width: '650px',
        data: {
          title: null,
          description: null,
        },
      });
    } else if (this.mode === 'edit') {
      // Edit control
      dialogRef = this.dialog.open(AssignmentTableLineComponent, {
        width: '650px',
        data: {
          title: currentControl.value.title,
          description: currentControl.value.description,
        },
      });
    } else if (this.mode === 'upload') {
      // Edit control
      dialogRef = this.dialog.open(fileTableLineComponent, {
        width: '650px',
        data: {
          file: null,
          currentControl,
        },
      });
    }

    // on clicking save to the dialog
    dialogRef.afterClosed().subscribe((dialogInput) => {
      let formIsInvalid: boolean = true;

      if (dialogInput) {
        if (this.mode !== 'upload') {
          const { title, description } = dialogInput;
          const resultArray = [title, description];
          formIsInvalid = resultArray.some(
            (item) => item === undefined || item === null
          );
        } else {
          const {
            courseId,
            description,
            filePath,
            fileType,
            id,
            instructorId,
            lastUpdate,
            position,
            title,
          } = dialogInput.currentControl.value;

          const resultArray = [filePath, fileType];

          formIsInvalid = resultArray.some(
            (item) => item === undefined || item === null
          );
          // update the form control

          if (dialogInput) {
            dialogInput.instructor = this.user.userName;
          }

          if (!this.noButtonIsClicked) {
            currentControl.patchValue({
              filePath,
              fileType,
            });
          }

          const assignment: Assignment = {
            courseId,
            description,
            filePath,
            fileType,
            id,
            instructorId,
            lastUpdate,
            position,
            title,
          };

          this.updateAssignment(assignment, controlIndex);
        }
      }

      if ((formIsInvalid || !dialogInput) && !this.noButtonIsClicked) {
        this.sharedService.throwError('Invalid input!');
        return;
      }

      this.saveAssignment(
        this.assignmentControls.length,
        dialogInput,
        controlIndex
      );
    });
  }

  // saves the new assignment to the db
  saveAssignment(
    controlsLength: number,
    assignmentInput: Assignment,
    controlIndex: number
  ): void | boolean {
    this.addItem(assignmentInput);

    let newControl = this.assignmentControls.get(`${controlsLength}`);

    if (!this.formIsValid(newControl)) {
      console.log('Invalid form');
      return;
    }

    if (this.mode === 'edit') {
      this.updateAssignment(assignmentInput, controlIndex);
    } else if (this.mode === 'create') {
      this.addNewAssignment(assignmentInput, newControl);
    }
  }

  // check specific controls, to be regarded valid
  formIsValid = (newControl: AbstractControl): boolean => {
    if (
      (newControl.get('title').valid && newControl.get('description').valid) ||
      newControl.get('filePath')
    ) {
      return true;
    }

    return false;
  };

  // updates a specific control
  updateAssignment(currentAssignment: Assignment, assignmentIndex: number) {
    currentAssignment.id = this.assignmentControls.get(
      `${assignmentIndex}`
    ).value.id;

    let currentControl = this.assignmentControls.get(`${assignmentIndex}`);

    this.isLoading = true;
    // update request
    this.assignmentsService.onUpdateAssignment(currentAssignment).subscribe(
      (response) => {
        if (response.fetchedAssignment.title) {
          // update the form control
          currentControl.patchValue({
            title: response.fetchedAssignment.title,
            description: response.fetchedAssignment.description,
          });
        }

        // update the table
        this.assignmentsService
          .getAssignments(
            this.assignmentsPerPage,
            this.currentPage,
            this.courseId
          )
          .subscribe((response) => {
            this.assignments = response.assignments;
            this.totalAssignments = response.maxAssignments;

            // update the table
            this.dataSource = new MatTableDataSource(this.assignments);
            this.isLoading = false;
          });
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  // add new assignment to the db
  addNewAssignment(assignmentInput: Assignment, newControl: AbstractControl) {
    this.isLoading = true;
    this.assignmentsService
      .addAssignment(assignmentInput, this.courseId)
      .subscribe((response) => {
        newControl.patchValue({
          id: response.createdAssignment.id,
        });

        this.assignmentsService
          .getAssignments(
            this.assignmentsPerPage,
            this.currentPage,
            this.courseId
          )
          .subscribe((response) => {
            this.assignments = response.assignments;
            this.totalAssignments = response.maxAssignments;

            this.dataSource = new MatTableDataSource(this.assignments);
            this.isLoading = false;
          });
        this.isLoading = false;
      });
  }

  // deletes a assignment with regard it's index
  deleteAssignment(controlIndex: number) {
    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    const courseId = this.assignmentControls.get(`${controlIndex}`).value
      .courseId;
    const assignmentId = this.assignmentControls.get(`${controlIndex}`).value
      .id;
    this.assignmentsService.onDelete(courseId, assignmentId).subscribe(
      (response) => {
        this.assignmentsService
          .getAssignments(
            this.assignmentsPerPage,
            this.currentPage,
            this.courseId
          )
          .subscribe((response) => {
            this.assignments = response.assignments;
            this.totalAssignments = response.maxAssignments;

            // remove from the formArray
            this.assignmentControls.removeAt(controlIndex);

            // update the table
            this.dataSource = new MatTableDataSource(this.assignments);
            this.isLoading = false;
          });
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onDownloadAssignment(assignment: Assignment) {
    this.isLoading = true;
    this.assignmentsService
      .downloadAssignment(this.courseId, assignment)
      .subscribe((response: Blob) => {
        saveAs(response, assignment.title);
        this.isLoading = false;
      });
  }

  // fetches the assignments of the corresponding page of the pagination
  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.assignmentsPerPage = pageData.pageSize;
    this.assignmentsService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource(response.assignments);
        this.isLoading = false;
      });
  }

  initializeControls() {
    // define and initialize the form group and formArray
    this.assignmentsForm = this.formBuilder.group({
      assignmentsFormArray: this.formBuilder.array([]),
    });
  }

  // adds a control in the controlArray
  addItem(item: Assignment = this.emptyAssignment): void {
    this.assignmentControls.push(this.createItem(item));
    this.assignmentControls.updateValueAndValidity();
  }

  // initialize a form control
  createItem(item: Assignment): FormGroup {
    return this.formBuilder.group({
      id: [item.id, Validators.required],
      position: [item.position, Validators.required],
      title: [item.title, Validators.required],
      description: [item.description, Validators.required],
      lastUpdate: [item.lastUpdate, Validators.required],
      instructorId: [item.instructorId, Validators.required],
      courseId: [item.courseId, Validators.required],
      filePath: [item.filePath],
      fileType: [item.fileType],
    });
  }
}
