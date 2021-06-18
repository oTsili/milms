import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { AssignmentsService } from 'src/app/courses/course/assignments/assignments.service';
import { CoursesService } from 'src/app/courses/courses.service';
import { HeaderService } from 'src/app/header/header.service';
import { Assignment } from 'src/app/models/assignment.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-student-assignments',
  templateUrl: './student-assignments.component.html',
  styleUrls: ['./student-assignments.component.css'],
})
export class StudentAssignmentsComponent implements OnInit, OnDestroy {
  user: {
    userPhotoPath: string;
    userName: string;
  };
  emptyAssignment: Assignment = {
    id: null,
    position: null,
    title: null,
    description: null,
    lastUpdate: null,
    filePath: null,
    fileType: null,
    courseId: null,
  };
  isLoading = false;
  courseId: string;
  assignmentsForm: FormGroup;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  assignmentsUpdateSubscription: Subscription;
  assignments: Assignment[];
  totalAssignments = environment.TOTAL_COURSES;
  assignmentsPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  assignmentControls: FormArray;
  matPanelStep: boolean[] = [false];

  constructor(
    public route: ActivatedRoute,
    private assignmentsService: AssignmentsService,
    private sharedService: SharedService,
    private headerService: HeaderService,
    private coursesService: CoursesService,
    private formBuilder: FormBuilder,
    changeDetectorRef: ChangeDetectorRef,

    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
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
        console.log('courses updated');
        this.assignments = response.assignments;
        this.totalAssignments = response.maxAssignments;
      });

    // define and initialize the form group and formArray
    this.initializeControls();

    // fetch the courses
    this.assignmentsService
      .getAssignments(this.assignmentsPerPage, this.currentPage, this.courseId)
      .subscribe((response) => {
        this.assignments = response.assignments;
        this.totalAssignments = response.maxAssignments;
        if (this.totalAssignments > 0) {
          for (let course of this.assignments) {
            this.addItem(course);
          }
        }
        this.isLoading = false;
      });

    this.assignmentControls = this.assignmentsForm.get(
      'assignmentsFormArray'
    ) as FormArray;
  }

  ngOnDestroy() {}

  initializeControls() {
    // define and initialize the form group and formArray
    this.assignmentsForm = this.formBuilder.group({
      assignmentsFormArray: this.formBuilder.array([]),
    });
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
        this.courseId,
        JSON.stringify(sort)
      )
      .subscribe((response) => {
        this.assignments = response.assignments;
        // this.clearFormArray(this.assignmentControls);
        // for (let i = 0; i < this.assignments.length; i++) {
        //   this.addItem(this.assignments[i]);
        // }
        this.isLoading = false;
      });
  }

  // adds a control in the controlArray
  addItem(
    item: Assignment = this.emptyAssignment,
    assignmeControlIndex: number = null
  ): void {
    this.assignmentControls.push(this.createItem(item));
    this.assignmentControls.updateValueAndValidity();
    // expand each other mat-expansion-panel
    if (assignmeControlIndex === this.assignmentControls.length - 1) {
      this.setMatPanelStep(assignmeControlIndex);
    }
  }

  // initialize a form control
  createItem(item: Assignment): FormGroup {
    return this.formBuilder.group({
      id: [item.id, Validators.required],
      position: [item.position, Validators.required],
      title: [item.title, Validators.required],
      description: [item.description, Validators.required],
      lastUpdate: [item.lastUpdate, Validators.required],
    });
  }

  // expands the specific mat-expansion-panel
  setMatPanelStep(index: number) {
    this.matPanelStep[index] = true;
  }

  // downloads the specific file/assignment
  onDownload(assignment: Assignment, formControlIndex: number): void {
    this.isLoading = true;
    this.assignmentsService
      .downloadAssignment(this.courseId, assignment)
      .subscribe((response: Blob) => {
        saveAs(response, assignment.title);
        this.isLoading = false;
      });
  }
}
