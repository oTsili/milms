import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Course } from 'src/app/models/course.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/models/auth-data.model';

const BACKEND_URL = environment.COURSES_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private editableCourses: boolean[] = [false];
  private editButtonListener = new Subject<boolean[]>();
  private coursesUpdateListener = new Subject<{
    courses: Course[];
    coursesCount: number;
  }>();

  constructor(private http: HttpClient) {}

  /////// Subscriptions /////////

  getCoursesListener() {
    return this.coursesUpdateListener.asObservable();
  }

  onCoursesUpdate(updatedCourses: Course[], coursesNumber: number) {
    this.coursesUpdateListener.next({
      courses: [...updatedCourses],
      coursesCount: coursesNumber,
    });
  }

  getEditListener() {
    return this.editButtonListener.asObservable();
  }

  onEditEnable(courseIndex: number, coursessLength: number) {
    this.editableCourses[courseIndex] = true;
    this.editButtonListener.next(this.editableCourses);
  }

  onEditDisable(courseIndex: number, coursesLength: number) {
    this.editableCourses[courseIndex] = false;
    this.editButtonListener.next(this.editableCourses);
  }

  //////// Functions //////////

  getCourses(coursesPerPage: number, currentPage: number, sort: string = '') {
    const queryParams = `?pagesize=${coursesPerPage}&page=${currentPage}&sort=${sort}`;

    return this.http
      .get<{ message: string; courses: Course[]; maxCourses: number }>(
        `${BACKEND_URL}${queryParams}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((courseData) => {
          console.log(courseData);

          return {
            courses: courseData.courses.map((course, index) => {
              const instructor = `${(course.instructorId as User).firstName} ${
                (course.instructorId as User).lastName
              }`;

              return {
                position: (currentPage - 1) * coursesPerPage + (index + 1),
                id: course.id,
                title: course.title,
                description: course.description,
                instructor,

                createdAt: course.createdAt,
                year: course.year,
                semester: course.semester,
              };
            }),
            maxCourses: courseData.maxCourses,
          };
        })
      );
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

  onDelete(courseId: string) {
    return this.http.delete(`${BACKEND_URL}/${courseId}`, {
      withCredentials: true,
    });
  }

  onUpdateCourse(course: Course) {
    console.log(course);
    const { id } = course;

    return this.http.put<{ message: string; updatedCourse: Course }>(
      `${BACKEND_URL}/${id}`,
      course,
      {
        withCredentials: true,
      }
    );
  }

  getCourse(courseId: string) {
    return this.http.get<{ message: string; course: Course }>(
      `${BACKEND_URL}/${courseId}`,
      {
        withCredentials: true,
      }
    );
  }
}
