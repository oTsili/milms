import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../frontend/src/app/shared/services/shared.service';
import { Sort } from '@angular/material/sort';
import { Course, Task, Year } from '../../frontend/src/app/models/course.model';
import { CoursesService } from './courses.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { HeaderService } from '../../frontend/src/app/header/header.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css', './courses.component.scss'],
})
export class CoursesComponent implements OnInit, OnDestroy {
  userRole: string;
  mobileQuery: MediaQueryList;
  private editButtonSub: Subscription;
  private userRoleSub: Subscription;
  editableCourses: boolean[] = [false];
  matPanelStep: boolean[] = [false];
  courses: Course[] = [];
  courseControls;
  coursesForm: FormGroup;
  panelOpenState = false;
  emptyCourse = {
    id: null,
    courseTitle: null,
    description: null,
    semester: null,
    year: null,
    createdAt: null,
    instructor: null,
  };
  currentCourse = {
    id: null,
    courseTitle: null,
    description: null,
    semester: null,
    year: null,
    createdAt: null,
    instructor: null,
  };
  mode: string = 'create';
  addButtonClicked = false;
  isLoading: boolean = false;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  totalCourses = 0;
  coursesPerPage = 5;
  currentPage = 1;
  allYearComplete: boolean = false;
  allSemesterComplete: boolean = false;

  constructor(
    private sharedService: SharedService,
    private coursesService: CoursesService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    private router: Router,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.sharedService.enableBreadcrumb(true);

    // initialize the boolean custom attributes of control array
    for (let i = 1; i < this.coursesPerPage - 1; i++) {
      this.editableCourses.push(false);
      this.matPanelStep.push(false);
    }

    // update the null values of the current user to be used in new assignments
    const user = this.headerService.getUserData();
    this.currentCourse.instructor = user.userName;

    // define and initialize the form group and formArray
    this.coursesForm = this.formBuilder.group({
      coursesFormArray: this.formBuilder.array([]),
    });

    this.isLoading = true;
    this.editButtonSub = this.coursesService
      .getEditListener()
      .subscribe((currentEditablecourses: boolean[]) => {
        this.editableCourses = currentEditablecourses;
      });

    this.userRoleSub = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        this.userRole = response;
      });

    this.sharedService.getUserRole().subscribe((response) => {
      this.userRole = response.userRole;
      this.sharedService.onUserRoleUpdate(this.userRole);
      this.isLoading = false;
    });

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

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.userRoleSub.unsubscribe();
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

  private _mobileQueryListener: () => void;

  // fetches the courses sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.courses = this.courses.slice();
      return;
    }

    this.isLoading = true;
    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage, JSON.stringify(sort))
      .subscribe((fetchedCourses) => {
        this.courses = fetchedCourses.courses;
        this.coursesService.clearFormArray(this.courseControls);
        for (let i = 0; i < this.courses.length; i++) {
          this.addItem(this.courses[i]);
        }
        this.isLoading = false;
      });
  }

  // adds a control in the controlArray
  addItem(
    item: Course = this.emptyCourse,
    courseControlIndex: number = null
  ): void {
    this.addButtonClicked = true;

    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;

    this.courseControls.push(this.createItem(item));

    this.courseControls.updateValueAndValidity();

    // expand each other mat-expansion-panel
    if (courseControlIndex === this.courseControls.length - 1) {
      this.permitEdit(null, courseControlIndex);
      this.setMatPanelStep(courseControlIndex);
    }
  }

  // initialize a form control
  createItem(item: Course): FormGroup {
    return this.formBuilder.group({
      id: [item.id, Validators.required],
      courseTitle: [item.courseTitle, Validators.required],
      description: [item.description, Validators.required],
      semester: [item.semester, Validators.required],
      year: [item.year, Validators.required],
      createdAt: [item.createdAt, Validators.required],
      instructor: [item.instructor, Validators.required],
    });
  }

  // enables the input functionality in the corresponding control
  permitEdit(event: Event, courseIndex: number) {
    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;

    if (this.courseControls.get(`${courseIndex}`)) {
      this.coursesService.enableEdit(courseIndex, this.courses.length);
    }
  }

  // expands the specific mat-expansion-panel
  setMatPanelStep(index: number) {
    this.matPanelStep[index] = true;
  }

  // collapses all the mat-expansion-panels
  resetMatPanelStep() {
    this.matPanelStep = [false];
  }

  // collapses a specific mat-expansion-panel
  collapseMatPanelStep(index: number) {
    this.matPanelStep[index] = false;
  }

  // saves the changes (update of an course or the creation of a new course)
  onSaveCourse(event: Event, course: FormControl, formControlIndex: number) {
    course.patchValue({
      createdAt: new Date().toString(),
    });

    course.updateValueAndValidity();

    const currentCourse: Course = {
      id: course.value.id,
      courseTitle: course.value.courseTitle,
      description: course.value.description,
      semester: course.value.semester,
      year: course.value.year,
      createdAt: course.value.createdAt,
      instructor: course.value.instructor,
    };

    // inform the app for the sumbmission
    this.coursesService.onSubmitted(formControlIndex);

    // check specific controls, to be regarded valid
    const formIsValid = (): boolean => {
      if (
        course.get('courseTitle').valid &&
        course.get('description').valid &&
        course.get('semester').valid &&
        course.get('year').valid &&
        course.get('createdAt').valid
      ) {
        return true;
      }

      return false;
    };

    if (!formIsValid()) {
      console.log('Invalid form');
      // TODO: throw an Error, not just console.log
      return;
    }

    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((fetchedCourses) => {
        this.courses = fetchedCourses.courses;
        this.totalCourses = fetchedCourses.maxCourses;

        // this.addItem(course);
        // this.courseSubmitted[] = true;
        this.coursesService.onSubmitted(formControlIndex);

        if (formControlIndex <= this.totalCourses - 1) {
          this.mode = 'edit';
        } else {
          this.mode = 'create';
        }

        this.isLoading = true;
        if (this.mode === 'create') {
          this.coursesService
            .addCourse(currentCourse)
            .subscribe((responseData) => {
              let currentControl = (
                this.coursesForm.get('coursesFormArray') as FormArray
              ).get(`${formControlIndex}`);

              // change the value of a single form control with the name filePath
              currentControl.patchValue({
                id: responseData.currentCourse.id,
                courseTitle: responseData.currentCourse.courseTitle,
                description: responseData.currentCourse.description,
                semester: responseData.currentCourse.semester,
                year: responseData.currentCourse.year,
                createdAt: responseData.currentCourse.createdAt,
              });

              // update and validate the image field value
              currentControl.updateValueAndValidity();

              this.router.navigate(['/courses']);
            });
        } else {
          currentCourse.id = this.courses[formControlIndex].id;
          this.coursesService
            .updateCourse(currentCourse)
            .subscribe((responseData) => {
              this.router.navigate(['/courses']);
            });
        }

        this.coursesService.disableEdit(formControlIndex, this.courses.length);
        this.coursesService.disableSubmit(formControlIndex);

        this.isLoading = false;
      });
  }

  // deletes a course with regard it's index
  onDelete(formControlIndex: number) {
    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;

    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((fetchedCourses) => {
        this.courses = fetchedCourses.courses;
        this.totalCourses = fetchedCourses.maxCourses;
        this.isLoading = true;

        this.coursesService
          .deleteCourse(this.courseControls.get(`${formControlIndex}`).value.id)
          .subscribe(
            () => {
              this.courseControls.removeAt(this.courseControls.length - 1);

              this.isLoading = false;
            },
            () => {
              this.isLoading = false;
            }
          );
      });
  }

  onCancel(event: Event, formControlIndex: number) {
    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;

    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((fetchedCourses) => {
        this.courses = fetchedCourses.courses;
        this.totalCourses = fetchedCourses.maxCourses;
        this.isLoading = true;

        if (formControlIndex <= this.totalCourses - 1) {
          this.mode = 'edit';
        } else {
          this.mode = 'create';
        }

        if (this.mode === 'create') {
          this.courseControls.removeAt(this.courseControls.length - 1);
          this.isLoading = false;
        } else {
          this.coursesService.disableEdit(
            formControlIndex,
            this.courses.length
          );
          this.collapseMatPanelStep(formControlIndex);
          this.isLoading = false;
        }
      });
  }
}
