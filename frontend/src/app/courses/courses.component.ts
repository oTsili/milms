import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { CoursesService } from './courses.service';
import { Course } from '../models/course.model';
import { SharedService } from '../shared/services/shared.service';
import { NewTableLineComponent } from 'src/app/shared/matDialog/newTableLine/newTableLine.component';
import { HeaderService } from '../header/header.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css', './courses.component.scss'],
})
export class CoursesComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  dataSource;
  displayedColumns: string[] = [
    'position',
    'title',
    'description',
    'instructor',
    'navigate',
  ];
  emptyAssignment: Course = {
    id: null,
    title: null,
    description: null,
    semester: null,
    year: null,
    createdAt: null,
    instructor: null,
  };

  currentAssignment: Course = {
    id: null,
    title: null,
    description: null,
    semester: null,
    year: null,
    createdAt: null,
    instructor: null,
  };
  user: {
    userPhotoPath: string;
    userName: string;
  };
  addButtonClicked = false;
  matPanelStep: boolean[] = [false];
  private coursesUpdateSubscription: Subscription;
  private userRoleSubscription: Subscription;
  courses: Course[];
  courseControls: FormArray;
  userRole: string;
  coursesCount: number;
  coursesForm: FormGroup;
  isLoading = false;
  totalCourses = 0;
  coursesPerPage = 5;
  currentPage = 1;

  constructor(
    private coursesService: CoursesService,
    private sharedService: SharedService,
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {
    this.sharedService.getUserRole().subscribe((response) => {
      this.userRole = response.userRole;
    });
  }

  ngOnInit(): void {
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

    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        console.log(response);
        this.userRole = response;
      });

    // define and initialize the form group and formArray
    this.coursesForm = this.formBuilder.group({
      coursesFormArray: this.formBuilder.array([]),
    });

    // fetch the courses
    this.coursesService
      .getCourses(this.coursesPerPage, this.currentPage)
      .subscribe((response) => {
        console.log(response);
        this.courses = response.courses;
        this.totalCourses = response.maxCourses;

        if (this.totalCourses > 0) {
          for (let course of this.courses) {
            this.addItem(course);
          }
        }
        this.dataSource = new MatTableDataSource(this.courses);
        console.log(this.dataSource);
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

  openDialog(): void {
    const dialogRef = this.dialog.open(NewTableLineComponent, {
      width: '350px',
      data: {
        title: null,
        description: null,
        semester: null,
        year: null,
      },
    });

    // on clicking save to the dialog
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      console.log(result);
      this.addItem(result);
      let unsavedControlIndex = this.courseControls.length - 1;
      this.saveCourse(unsavedControlIndex, result);
      this.dataSource = new MatTableDataSource(this.courseControls.value);
    });
  }

  // adds a control in the controlArray
  addItem(item: Course = this.emptyAssignment): void {
    this.addButtonClicked = true;
    this.courseControls.push(this.createItem(item));
    this.courseControls.updateValueAndValidity();
  }

  // saves the new course to the db
  saveCourse(index: number, item: Course): void {
    let newControl = this.courseControls.get(`${index}`);
    newControl.patchValue({
      createdAt: new Date().toString(),
    });

    newControl.patchValue({
      instructor: this.user.userName,
    });

    // check specific controls, to be regarded valid
    const formIsValid = (): boolean => {
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

    if (!formIsValid()) {
      console.log('Invalid form');
      this.sharedService.throwError('Invalid input!');
      return;
    }

    this.isLoading = true;
    this.coursesService.addCourse(item).subscribe((response) => {
      newControl.patchValue({
        id: response.currentCourse.id,
        createdAt: response.currentCourse.createdAt,
      });
    });
  }

  // initialize a form control
  createItem(item: Course): FormGroup {
    return this.formBuilder.group({
      id: [item.id, Validators.required],
      title: [item.title, Validators.required],
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
      this.coursesService.onEditEnable(courseIndex, this.courses.length);
    }
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
}
