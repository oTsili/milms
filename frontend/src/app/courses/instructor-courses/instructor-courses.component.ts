import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { Sort } from '@angular/material/sort';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { CoursesService } from 'src/app/courses/courses.service';
import { Course } from 'src/app/models/course.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CourseTableLineomponent } from 'src/app/shared/matDialog/courseTableLine/courseTableLine.component';
import { HeaderService } from 'src/app/header/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-instructor-courses',
  templateUrl: './instructor-courses.component.html',
  styleUrls: ['./instructor-courses.component.css'],
})
export class InstructorCoursesComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  dataSource;
  displayedColumns: string[] = [
    'position',
    'title',
    'description',
    'year',
    'semester',
    'instructor',
    'options',
  ];
  emptyCourse: Course = {
    id: null,
    position: null,
    title: null,
    description: null,
    semester: null,
    year: null,
    lastUpdate: null,
    instructor: null,
  };

  user: {
    userPhotoPath: string;
    userName: string;
  };
  addButtonClicked = false;
  matPanelStep: boolean[] = [false];
  private coursesUpdateSubscription: Subscription;
  courses: Course[];
  courseControls: FormArray;
  userRole: string;
  mode: string;
  coursesForm: FormGroup;
  isLoading = false;
  pageSizeOptions = environment.PAGE_SIZE_OPTIONS;
  totalCourses = environment.TOTAL_COURSES;
  coursesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    private coursesService: CoursesService,
    private sharedService: SharedService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
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
        this.totalCourses = response.coursesCount;
      });

    // define and initialize the form group and formArray
    this.initializeControls();

    // fetch the courses
    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((response) => {
        this.courses = response.courses;
        this.totalCourses = response.maxCourses;

        if (this.totalCourses > 0) {
          for (let course of this.courses) {
            this.addItem(course);
          }
        }
        this.dataSource = new MatTableDataSource(this.courses);
        this.isLoading = false;
      });

    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;
  }

  ngOnDestroy(): void {
    this.coursesUpdateSubscription.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  openDialog(controlIndex: number, mode: string): void {
    this.mode = mode;
    let currentControl = this.courseControls.get(`${controlIndex}`);

    let dialogRef: MatDialogRef<CourseTableLineomponent, any>;

    if (this.mode === 'create') {
      //  Add new control
      dialogRef = this.dialog.open(CourseTableLineomponent, {
        width: '350px',
        data: {
          title: null,
          description: null,
          semester: null,
          year: null,
        },
      });
    } else if (this.mode === 'edit') {
      // Edit control
      dialogRef = this.dialog.open(CourseTableLineomponent, {
        width: '350px',
        data: {
          title: currentControl.value.title,
          description: currentControl.value.description,
          semester: currentControl.value.semester,
          year: currentControl.value.year,
        },
      });
    }

    // on clicking save to the dialog
    dialogRef.afterClosed().subscribe((dialogInput) => {
      let formIsInvalid: boolean = true;

      if (dialogInput) {
        const { title, description, semester, year } = dialogInput;
        const resultArray = [title, description, semester, year];
        formIsInvalid = resultArray.some(
          (item) => item === undefined || item === null
        );
      }

      if (formIsInvalid || !dialogInput) {
        this.sharedService.throwError('Invalid input!');
        return;
      }

      dialogInput.lastUpdate = new Date().toString();
      dialogInput.instructor = this.user.userName;
      this.saveCourse(this.courseControls.length, dialogInput, controlIndex);
    });
  }

  // saves the new course to the db
  saveCourse(
    controlsLength: number,
    courseInput: Course,
    controlIndex: number
  ): void | boolean {
    this.addItem(courseInput);

    let newControl = this.courseControls.get(`${controlsLength}`);

    if (!this.formIsValid(newControl)) {
      console.log('Invalid form');
      return;
    }

    if (this.mode === 'edit') {
      this.updateCourse(courseInput, controlIndex);
    } else if (this.mode === 'create') {
      this.addNewCourse(courseInput, newControl);
    }
  }

  // check specific controls, to be regarded valid
  formIsValid = (newControl: AbstractControl): boolean => {
    if (
      newControl.get('title').valid &&
      newControl.get('description').valid &&
      newControl.get('semester').valid &&
      newControl.get('year').valid
    ) {
      return true;
    }

    return false;
  };

  // updates a specific control
  updateCourse(currentCourse: Course, courseIndex: number) {
    currentCourse.id = this.courseControls.get(`${courseIndex}`).value.id;
    this.coursesService.onUpdateCourse(currentCourse).subscribe(
      (response) => {
        this.coursesService
          .getCourses(this.coursesPerPage, this.currentPage)
          .subscribe((fetchedCourses) => {
            this.courses = fetchedCourses.courses;
            this.totalCourses = fetchedCourses.maxCourses;

            // remove from the formArray
            this.courseControls.removeAt(courseIndex);

            // update the table
            this.dataSource = new MatTableDataSource(this.courses);
            this.isLoading = false;
          });
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  // add new course to the db
  addNewCourse(courseInput: Course, newControl: AbstractControl) {
    this.isLoading = true;
    this.coursesService.addCourse(courseInput).subscribe((response) => {
      newControl.patchValue({
        id: response.currentCourse.id,
      });

      this.coursesService
        .getCourses(this.coursesPerPage, this.currentPage)
        .subscribe((fetchedCourses) => {
          this.courses = fetchedCourses.courses;
          this.totalCourses = fetchedCourses.maxCourses;

          this.dataSource = new MatTableDataSource(this.courses);
          this.isLoading = false;
        });
      this.isLoading = false;
    });
  }

  // deletes a course with regard it's index
  deleteCourse(controlIndex: number) {
    this.courseControls = this.coursesForm.get('coursesFormArray') as FormArray;

    this.coursesService
      .onDelete(this.courseControls.get(`${controlIndex}`).value.id)
      .subscribe(
        (response) => {
          this.coursesService
            .getCourses(this.coursesPerPage, this.currentPage)
            .subscribe((fetchedCourses) => {
              this.courses = fetchedCourses.courses;
              this.totalCourses = fetchedCourses.maxCourses;

              // remove from the formArray
              this.courseControls.removeAt(controlIndex);

              // update the table
              this.dataSource = new MatTableDataSource(this.courses);
              this.isLoading = false;
            });
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  // fetches the assignments of the corresponding page of the pagination
  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.coursesPerPage = pageData.pageSize;
    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource(response.courses);
        this.isLoading = false;
      });
  }

  initializeControls() {
    // define and initialize the form group and formArray
    this.coursesForm = this.formBuilder.group({
      coursesFormArray: this.formBuilder.array([]),
    });
  }

  // adds a control in the controlArray
  addItem(item: Course = this.emptyCourse): void {
    this.addButtonClicked = true;
    this.courseControls.push(this.createItem(item));
    this.courseControls.updateValueAndValidity();
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
      lastUpdate: [item.lastUpdate, Validators.required],
      instructor: [item.instructor, Validators.required],
    });
  }
}
