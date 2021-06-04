import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { Course } from '../models/course.model';
import { SharedService } from '../shared/services/shared.service';

const BACKEND_URL = environment.COURSES_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private editableCourses: boolean[] = [false];
  private editButtonListener = new Subject<boolean[]>();
  private submitListener = new Subject<boolean[]>();
  private submittedCourses: boolean[] = [false];

  constructor(private http: HttpClient, private sharedService: SharedService) {}

  getEditListener() {
    return this.editButtonListener.asObservable();
  }

  enableEdit(courseIndex: number, coursessLength: number) {
    this.editableCourses[courseIndex] = true;
    this.editButtonListener.next(this.editableCourses);
  }

  disableEdit(courseIndex: number, coursesLength: number) {
    this.editableCourses[courseIndex] = false;
    this.editButtonListener.next(this.editableCourses);
  }

  getSubmitListener() {
    return this.submitListener.asObservable();
  }

  onSubmitted(assignmentIndex: number) {
    this.submittedCourses[assignmentIndex] = true;
    this.submitListener.next(this.submittedCourses);
  }

  disableSubmit(assignmentIndex: number) {
    this.submittedCourses[assignmentIndex] = false;
    this.submitListener.next(this.submittedCourses);
  }

  getCourses(coursesPerPage: number, currentPage: number, sort: string = '') {
    const queryParams = `?pagesize=${coursesPerPage}&page=${currentPage}&sort=${sort}`;

    return this.http
      .get<{ message: string; courses: any; maxCourses: number }>(
        BACKEND_URL + queryParams,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((courseData) => {
          return {
            courses: courseData.courses.map(
              (course: {
                id?: string;
                courseTitle: string;
                description: string;
                semester: string;
                year: string;
                createdAt: string;
                instructorId: {
                  firstName: string;
                  lastName: string;
                  id: string;
                  email: string;
                  role: string;
                };
              }) => {
                return {
                  id: course.id,
                  courseTitle: course.courseTitle,
                  description: course.description,
                  semester: course.semester,
                  year: course.year,
                  createdAt: course.createdAt,
                  instructor: `${course.instructorId.firstName} ${course.instructorId.lastName}`,
                };
              }
            ),
            maxCourses: courseData.maxCourses,
          };
        })
      );
  }

  // removes all the values controls of the formArray
  clearFormArray(formArray: FormArray) {
    if (formArray) {
      while (formArray.length !== 0) {
        formArray.removeAt(0);
      }
    }
  }

  addCourse(course: Course) {
    return (
      this.http
        // generic type definition, to define what is going to be returned from the http request
        .post<{ message: string; currentCourse: Course }>(BACKEND_URL, course, {
          withCredentials: true,
        })
    );
  }

  updateCourse(course: Course) {
    const { id } = course;

    return this.http.put<{ message: string; updatedAssignment: Course }>(
      `${BACKEND_URL}/${id}`,
      course,
      {
        withCredentials: true,
      }
    );
  }

  deleteCourse(courseId: string) {
    return this.http.delete(`${BACKEND_URL}/${courseId}`, {
      withCredentials: true,
    });
  }
}
