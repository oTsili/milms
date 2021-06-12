import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { HeaderService } from 'src/app/header/header.service';
import { Assignment } from '../../../models/assignment.model';
import { AssignmentsService } from '../assignment.service';
import { assignmentMimeType } from '../../../shared/validators/assignment-mime-type.validator';
import { SharedService } from '../../../shared/services/shared.service';
import { MaterialsService } from './material-list/materials.service';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: [
    './assignment-list.component.css',
    './assignment-list.component.scss',
  ],
})
export class AssignmentListComponent implements OnInit, OnDestroy {
  private assignmentSub: Subscription;
  private editButtonSub: Subscription;
  private submitButtonSub: Subscription;
  private filePickedSub: Subscription;
  private userRoleSub: Subscription;

  assignments: Assignment[] = [];
  assignmentsForm: FormGroup;
  assignmentControls;
  fileTitle: string;
  userRole: string;
  editableAssignments: boolean[] = [false];
  filePickedAssignments: boolean[] = [false];
  matPanelStep: boolean[] = [false];
  assignmentSubmitted: boolean[] = [false];

  courseId: string;
  addButtonClicked = false;
  emptyAssignment = {
    title: null,
    description: null,
    filePath: null,
    fileType: null,
    id: null,
    lastUpdate: null,
    userName: null,
    courseId: null,
    materials: null,
  };
  currentAssignment = {
    title: null,
    description: null,
    filePath: null,
    fileType: null,
    id: null,
    lastUpdate: null,
    userName: null,
    courseId: null,
    materials: null,
  };
  mode: string = 'create';
  isLoading: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  totalAssignments = 0;
  assignmentsPerPage = 5;
  currentPage = 1;

  constructor(
    public assignmentService: AssignmentsService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private headerService: HeaderService,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else {
        throw new Error('no course id provided');
      }
    });

    this.sharedService.enableBreadcrumb(true);
    let currentDate = this.sharedService.toHumanDateTime(new Date().toString());

    // initialize the boolean custom attributes of control array
    for (let i = 1; i < this.assignmentsPerPage - 1; i++) {
      this.editableAssignments.push(false);
      this.filePickedAssignments.push(false);
      this.matPanelStep.push(false);
    }

    // define and initialize the form group and formArray
    this.assignmentsForm = this.formBuilder.group({
      assignmentsFormArray: this.formBuilder.array([
        // this.createItem(this.emptyAssignment),
      ]),
    });

    // update the null values of the current user to be used in new assignments
    this.currentAssignment.lastUpdate = currentDate;
    const user = this.headerService.getUserData();
    this.currentAssignment.userName = user.userName;

    // define custom subscriptions
    this.isLoading = true;
    this.userRoleSub = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        console.log(response);
        this.userRole = response;
      });

    this.editButtonSub = this.assignmentService
      .getEditListener()
      .subscribe((currentEditableAssignments: boolean[]) => {
        this.editableAssignments = currentEditableAssignments;
      });

    this.filePickedSub = this.assignmentService
      .getFilePickedListener()
      .subscribe((currentfilePickedAssignments: boolean[]) => {
        this.filePickedAssignments = currentfilePickedAssignments;
      });

    this.submitButtonSub = this.assignmentService
      .getSubmitListener()
      .subscribe((submitted) => {
        this.assignmentSubmitted = submitted;
      });

    this.assignmentSub = this.assignmentService
      .getAssignmentUpdateListener()
      .subscribe(
        (assignmentData: {
          assignments: Assignment[];
          assignmentCount: number;
        }) => {
          this.isLoading = false;
          this.totalAssignments = assignmentData.assignmentCount;
          this.assignments = assignmentData.assignments;
        }
      );

    // fetch the assignments
    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((fetchedAssignments) => {
        console.log(fetchedAssignments);
        this.assignments = fetchedAssignments.assignments;
        this.totalAssignments = fetchedAssignments.maxAssignments;
        console.log(this.assignments);
        console.log(this.totalAssignments);
        if (this.totalAssignments > 0) {
          for (let assignment of this.assignments) {
            this.addItem(assignment);
          }
        }
        console.log(this.assignmentsForm);
        this.isLoading = false;
      });
  }

  // initialize a form control
  createItem(item: Assignment): FormGroup {
    return this.formBuilder.group({
      title: [item.title, Validators.required],
      description: [item.description, Validators.required],
      filePath: [item.filePath, Validators.required, assignmentMimeType],
      fileType: [item.fileType, Validators.required],
      id: [item.id, Validators.required],
      lastUpdate: [item.lastUpdate, Validators.required],
      userName: [item.userName, Validators.required],
      courseId: [this.courseId, Validators.required],
    });
  }

  // removes all the values controls of the formArray
  clearFormArray(formArray: FormArray) {
    if (formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0);
      }
    }
  }

  // updates a specific assignment with regard its index
  updateAssignment(index: number) {
    let currentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${index}`);

    currentControl.setValue({
      title: currentControl.value.title,
      description: currentControl.value.description,
      filePath: currentControl.value.filePath,
      fileType: currentControl.value.fileType,
      id: currentControl.value.id,
      lastUpdate: currentControl.value.lastUpdate,
      userName: currentControl.value.userName,
      courseId: this.courseId,
      materials: currentControl.value.materials,
      studentDeliveries: currentControl.value.studentDeliveries,
    });
    currentControl.updateValueAndValidity();
  }

  // adds a control in the controlArray
  addItem(
    item: Assignment = this.emptyAssignment,
    assignmentControlIndex: number = null
  ): void {
    this.addButtonClicked = true;

    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    this.assignmentControls.push(this.createItem(item));
    this.assignmentControls.updateValueAndValidity();

    // expand each other mat-expansion-panel
    if (assignmentControlIndex === this.assignmentControls.length - 1) {
      this.permitEdit(null, assignmentControlIndex);
      this.setMatPanelStep(assignmentControlIndex);
    }
  }

  // enables the input functionality in the corresponding control
  permitEdit(event: Event, assignmentIndex: number) {
    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    if (this.assignmentControls.get(`${assignmentIndex}`)) {
      this.assignmentService.enableEdit(
        assignmentIndex,
        this.assignments.length
      );
    }
  }

  // saves the changes (update of an assignment or the creation of a new assignment)
  onSaveAssignment(
    event: Event,
    assignment: FormControl,
    formControlIndex: number
  ) {
    const currentAssignment: Assignment = {
      courseId: this.courseId,
      title: assignment.value.title,
      description: assignment.value.description,
      filePath: assignment.value.filePath,
      fileType: assignment.value.fileType,
      lastUpdate: assignment.value.lastUpdate,
      userName: assignment.value.userName,
    };

    console.log(currentAssignment);

    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    // inform the app for the sumbmission
    this.assignmentService.onSubmitted(formControlIndex);

    const currentAssignmentControl = (
      this.assignmentsForm.get('assignmentsFormArray') as FormArray
    ).get(`${formControlIndex}`) as FormControl;

    // check specific controls, to be regarded valid
    const formIsValid = (): boolean => {
      if (
        currentAssignmentControl.get('title').valid &&
        currentAssignmentControl.get('description').valid &&
        currentAssignmentControl.get('filePath').valid
      ) {
        return true;
      }

      return false;
    };

    if (!formIsValid()) {
      console.log('Invalid form');
      console.log(currentAssignmentControl.get('filePath'));
      // TODO: throw an Error, not just console.log
      return;
    }

    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((fetchedAssignments) => {
        this.assignments = fetchedAssignments.assignments;
        this.totalAssignments = fetchedAssignments.maxAssignments;

        // this.addItem(assignment);
        // this.assignmentSubmitted[] = true;

        if (formControlIndex <= this.totalAssignments - 1) {
          this.mode = 'edit';
        } else {
          this.mode = 'create';
        }

        console.log(assignment);

        this.isLoading = true;
        if (this.mode === 'create') {
          this.assignmentService
            .addAssignment(currentAssignment)
            .subscribe((responseData) => {
              console.log(responseData);

              const currentControl = (
                this.assignmentsForm.get('assignmentsFormArray') as FormArray
              ).get(`${formControlIndex}`) as FormControl;

              const currentAssignmentFilePath =
                responseData.updatedCourse.assignments[formControlIndex]
                  .filePath;
              const currentAssignmentFileType =
                responseData.updatedCourse.assignments[formControlIndex]
                  .fileType;
              const currentAssignmentId =
                responseData.updatedCourse.assignments[formControlIndex].id;

              // change the value of a single form control with the name filePath
              currentControl.patchValue({
                fileType: currentAssignmentFileType,
                filePath: currentAssignmentFilePath,
                id: currentAssignmentId,
              });

              // update and validate the image field value
              currentControl.updateValueAndValidity();
              console.log(currentControl);
              this.assignmentService.onAssignmentIdUpdate(currentAssignmentId);

              this.router.navigate([`courses/${this.courseId}/assignments`]);
            });
        } else {
          let currentAssignment = {
            id: this.assignments[formControlIndex].id,
            title: assignment.value.title,
            description: assignment.value.description,
            filePath: assignment.value.filePath,
            fileType: assignment.value.mimeType,
            lastUpdate: assignment.value.lastUpdate,
            courseId: this.courseId,
            materials: assignment.value.materials,
            studentDeliveries: assignment.value.studentDeliveries,
          };
          this.assignmentService
            .updateAssignment(currentAssignment)
            .subscribe((responseData) => {
              console.log(responseData);

              currentAssignmentControl.patchValue({
                fileType: responseData.updatedAssignment.fileType,
                filePath: responseData.updatedAssignment.filePath,
                id: responseData.updatedAssignment.id,
              });
              this.router.navigate([`courses/${this.courseId}/assignments`]);
            });
        }

        this.assignmentService.disableEdit(
          formControlIndex,
          this.assignments.length
        );
        this.assignmentService.disableSubmit(formControlIndex);
        this.assignmentService.resetFilePicked();

        this.isLoading = false;
      });
  }

  // deletes an assignment with regard it's index
  onDelete(assignment: FormControl, formControlIndex: number) {
    const currentAssignment: Assignment = {
      courseId: this.courseId,
      title: assignment.value.title,
      description: assignment.value.description,
      filePath: assignment.value.filePath,
      fileType: assignment.value.fileType,
      lastUpdate: assignment.value.lastUpdate,
      userName: assignment.value.userName,
    };

    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((fetchedAssignments) => {
        this.assignments = fetchedAssignments.assignments;
        this.totalAssignments = fetchedAssignments.maxAssignments;

        this.isLoading = true;
        this.assignmentService
          .deleteAssignment(
            currentAssignment,
            this.assignmentControls.get(`${formControlIndex}`).value.id
          )
          .subscribe(
            () => {
              this.assignmentControls.removeAt(
                this.assignmentControls.length - 1
              );

              // if
              if (formControlIndex === 0) {
                // this.assignments = [];
              }
              this.isLoading = false;
            },
            () => {
              this.isLoading = false;
            }
          );
      });
  }

  // reads a file after it has been picked from file explorer
  onFilePicked(event: Event, index: number) {
    // get the file
    const file = (event.target as HTMLInputElement).files[0];

    // change the value of a single form control with the name filePath
    this.assignmentControls.get(`${index}`).patchValue({
      filePath: file,
    });

    // update and validate the image field value
    this.assignmentControls.get(`${index}`).updateValueAndValidity();
  }

  // fetches the assignments of the corresponding page of the pagination
  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.assignmentsPerPage = pageData.pageSize;
    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((fetchedAssignments) => {
        this.assignments = fetchedAssignments.assignments;
        this.clearFormArray(this.assignmentControls);
        for (let i = 0; i < this.assignments.length; i++) {
          this.addItem(this.assignments[i]);
        }
        this.isLoading = false;
      });
  }

  // downloads the specific file/assignment
  onDownload(assignment: FormControl, formControlIndex: number): void {
    let fileName;
    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((responseData) => {
        console.log(responseData);
        fileName = responseData.assignments[formControlIndex].filePath
          .split('/')
          .slice(-1)
          .pop();

        this.isLoading = true;
        this.assignmentService
          .downloadAssignment(
            fileName,
            responseData.assignments[formControlIndex]
          )
          .subscribe((response: Blob) => {
            saveAs(response, fileName);
            this.isLoading = false;
          });
      });
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.assignments = this.assignments.slice();
      return;
    }

    this.isLoading = true;
    this.assignmentService
      .getAssignments(
        this.assignmentsPerPage,
        this.currentPage,
        JSON.stringify(sort)
      )
      .subscribe((fetchedAssignments) => {
        this.assignments = fetchedAssignments.assignments;
        this.clearFormArray(this.assignmentControls);
        for (let i = 0; i < this.assignments.length; i++) {
          this.addItem(this.assignments[i]);
        }
        this.isLoading = false;
      });
  }

  // expands the specific mat-expansion-panel
  setMatPanelStep(index: number) {
    this.matPanelStep[index] = true;
  }

  // collapses all the mat-expansion-panels
  resetMatPanelStep() {
    this.matPanelStep = [false];
  }

  // onDestroy hook unsubscribe from all the custom subscriptions
  ngOnDestroy() {
    this.assignmentSub.unsubscribe();
    // this.authStatusSub.unsubscribe();
    this.editButtonSub.unsubscribe();
    this.submitButtonSub.unsubscribe();
    this.filePickedSub.unsubscribe();
    this.userRoleSub.unsubscribe();
  }

  print(item: any): void {
    console.log(item);
  }

  onCancel(event: Event, formControlIndex: number) {
    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;

    this.assignmentService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((fetchedAssignments) => {
        console.log(fetchedAssignments);
        this.assignments = fetchedAssignments.assignments;
        this.totalAssignments = fetchedAssignments.maxAssignments;
        this.isLoading = true;

        if (formControlIndex <= this.totalAssignments - 1) {
          this.mode = 'edit';
        } else {
          this.mode = 'create';
        }

        if (this.mode === 'create') {
          this.assignmentControls.removeAt(this.assignmentControls.length - 1);
          this.isLoading = false;
        } else {
          this.assignmentService.disableEdit(
            formControlIndex,
            this.assignments.length
          );
          this.collapseMatPanelStep(formControlIndex);
          this.isLoading = false;
        }
      });
  }

  // collapses a specific mat-expansion-panel
  collapseMatPanelStep(index: number) {
    this.matPanelStep[index] = false;
  }

  toStudentDeliveries(assignmentId: string) {
    // if assignment hasn't saved on the db and thus does not have id throw an error
    if (!assignmentId) {
      // console.log('Please save the assignment first!');
      this.sharedService.throwError('Please save the assignment first!');

      return;
    }

    this.router.navigate([`${assignmentId}/studentDeliveries`], {
      relativeTo: this.route,
    });
  }
}
