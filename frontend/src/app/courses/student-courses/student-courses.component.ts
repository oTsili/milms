import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  NgForm,
  FormArray,
  Validators,
} from '@angular/forms';
import { MediaMatcher } from '@angular/cdk/layout';
import { Sort } from '@angular/material/sort';

import { HeaderService } from 'src/app/header/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CoursesService } from 'src/app/courses/courses.service';
import { Course, Task, Year } from 'src/app/models/course.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-student-courses',
  templateUrl: './student-courses.component.html',
  styleUrls: [
    './student-courses.component.css',
    './student-courses.component.scss',
  ],
})
export class StudentCoursesComponent implements OnInit, OnDestroy {
  user: {
    userPhotoPath: string;
    userName: string;
  };
  emptyCourse: Course = {
    id: null,
    position: null,
    title: null,
    description: null,
    semester: null,
    year: null,
    createdAt: null,
    instructor: null,
  };
  matPanelStep: boolean[] = [false];
  coursesUpdateSubscription: Subscription;
  courses: Course[] = [];
  coursesCount: number;
  coursesForm: FormGroup;
  courseControls: FormArray;
  isLoading = false;
  pageSizeOptions = environment.PAGE_SIZE_OPTIONS;
  totalCourses = environment.TOTAL_COURSES;
  coursesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  mobileQuery: MediaQueryList;
  allYearComplete: boolean = false;
  allSemesterComplete: boolean = false;
  private _mobileQueryListener: () => void;

  constructor(
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
    // enable the page breadcrumb
    this.sharedService.enableBreadcrumb(true);

    // update the null values of the current user to be used in new assignments
    this.user = this.headerService.getUserData();
    // define custom subscriptions
    this.coursesUpdateSubscription = this.coursesService
      .getCoursesListener()
      .subscribe((response) => {
        console.log('courses updated');
        this.courses = response.courses;
        this.coursesCount = response.coursesCount;
      });

    // define and initialize the form group and formArray
    this.initializeControls();

    // fetch the courses
    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((fetchedcourses) => {
        this.courses = fetchedcourses.courses;
        this.totalCourses = fetchedcourses.maxCourses;
        if (this.totalCourses > 0) {
          for (let course of this.courses) {
            this.addItem(course);
          }
        }
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.coursesUpdateSubscription.unsubscribe();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  years: Year[] = [
    { value: '2018', viewValue: '2018' },
    { value: '2019', viewValue: '2019' },
    { value: '2020', viewValue: '2020' },
    { value: '2021', viewValue: '2021' },
  ];

  // year checkbox
  yearTask: Task = {
    name: 'Year',
    completed: false,
    color: 'primary',
    subtasks: [
      { name: '2018', completed: false, color: 'primary' },
      { name: '2019', completed: false, color: 'primary' },
      { name: '2020', completed: false, color: 'primary' },
      { name: '2021', completed: false, color: 'primary' },
    ],
  };

  updateYearAllComplete() {
    this.allYearComplete =
      this.yearTask.subtasks != null &&
      this.yearTask.subtasks.every((t) => t.completed);
  }

  someYearComplete(): boolean {
    if (this.yearTask.subtasks == null) {
      return false;
    }
    return (
      this.yearTask.subtasks.filter((t) => t.completed).length > 0 &&
      !this.allYearComplete
    );
  }

  setYearAll(completed: boolean) {
    this.allYearComplete = completed;
    if (this.yearTask.subtasks == null) {
      return;
    }
    this.yearTask.subtasks.forEach((t) => (t.completed = completed));
  }

  // semester checkbox

  semesterTask: Task = {
    name: 'Semester',
    completed: false,
    color: 'primary',
    subtasks: [
      { name: 'a', completed: false, color: 'primary' },
      { name: 'b', completed: false, color: 'primary' },
    ],
  };

  updateSemesterAllComplete() {
    this.allSemesterComplete =
      this.semesterTask.subtasks != null &&
      this.semesterTask.subtasks.every((t) => t.completed);
  }

  someSemesterComplete(): boolean {
    if (this.semesterTask.subtasks == null) {
      return false;
    }
    return (
      this.semesterTask.subtasks.filter((t) => t.completed).length > 0 &&
      !this.allSemesterComplete
    );
  }

  setSemesterAll(completed: boolean) {
    this.allSemesterComplete = completed;
    if (this.semesterTask.subtasks == null) {
      return;
    }
    this.semesterTask.subtasks.forEach((t) => (t.completed = completed));
  }
  // end checkbox

  onCoursesUpdate(form: NgForm) {
    console.log(form);
  }

  initializeControls() {
    // define and initialize the form group and formArray
    this.coursesForm = this.formBuilder.group({
      coursesFormArray: this.formBuilder.array([]),
    });
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.courses = this.courses.slice();
      return;
    }

    this.isLoading = true;
    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage, JSON.stringify(sort))
      .subscribe((response) => {
        this.courses = response.courses;
        // this.clearFormArray(this.assignmentControls);
        // for (let i = 0; i < this.assignments.length; i++) {
        //   this.addItem(this.assignments[i]);
        // }
        this.isLoading = false;
      });
  }

  // adds a control in the controlArray
  addItem(
    item: Course = this.emptyCourse,
    courseControlIndex: number = null
  ): void {
    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;

    this.courseControls.push(this.createItem(item));

    this.courseControls.updateValueAndValidity();

    // expand each other mat-expansion-panel
    if (courseControlIndex === this.courseControls.length - 1) {
      this.setMatPanelStep(courseControlIndex);
    }
  }

  // initialize a form control
  createItem(item: Course): FormGroup {
    return this.formBuilder.group({
      id: [item.id, Validators.required],
      position: [item.position, Validators.required],
      title: [item.title, Validators.required],
      description: [item.description, Validators.required],
      semester: [item.semester, Validators.required],
      year: [item.year, Validators.required],
      createdAt: [item.createdAt, Validators.required],
      instructor: [item.instructor, Validators.required],
    });
  }

  // expands the specific mat-expansion-panel
  setMatPanelStep(index: number) {
    this.matPanelStep[index] = true;
  }
}
