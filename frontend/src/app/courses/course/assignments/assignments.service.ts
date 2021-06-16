import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Assignment } from 'src/app/models/assignment.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { User } from 'src/app/models/auth-data.model';

const BACKEND_URL = environment.COURSES_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class AssignmentsService {
  private assignmentsUpdateListener = new Subject<{
    assignments: Assignment[];
    maxAssignments: number;
  }>();
  constructor(private http: HttpClient) {}

  /////// Subscriptions /////////

  getAssignmentsListener() {
    return this.assignmentsUpdateListener.asObservable();
  }

  onAssignmentsUpdate(
    updatedAssignments: Assignment[],
    assignmentsNumber: number
  ) {
    this.assignmentsUpdateListener.next({
      assignments: [...updatedAssignments],
      maxAssignments: assignmentsNumber,
    });
  }

  //////// Functions //////////

  getAssignments(
    assignmentsPerPage: number,
    currentPage: number,
    courseId: string,
    sort: string = ''
  ) {
    const queryParams = `?pagesize=${assignmentsPerPage}&page=${currentPage}&sort=${sort}`;

    return this.http
      .get<{
        message: string;
        fetchedAssignments: Assignment[];
        maxAssignments: number;
      }>(`${BACKEND_URL}/${courseId}/assignments${queryParams}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          console.log(res);

          return {
            assignments: res.fetchedAssignments.map((assignment, index) => {
              const instructor = `${(assignment.instructorId as User).firstName}
               ${(assignment.instructorId as User).lastName}`;

              return {
                position: (currentPage - 1) * assignmentsPerPage + (index + 1),
                courseId: assignment.courseId,
                title: assignment.title,
                description: assignment.description,
                id: assignment.id,
                filePath: assignment.filePath,
                fileType: assignment.fileType,
                lastUpdate: assignment.lastUpdate,
                instructor,
              };
            }),
            maxAssignments: res.maxAssignments,
          };
        })
      );
  }

  getAssignment(courseId: string, assignmentId: string) {
    return this.http.get<{ message: string; assignment: Assignment }>(
      `${BACKEND_URL}/${courseId}/assignments/${assignmentId}`,
      {
        withCredentials: true,
      }
    );
  }

  onUpdateAssignment(assignment: Assignment) {
    console.log(assignment);
    const {
      id,
      title,
      courseId,
      description,
      filePath,
      fileType,
      instructorId,
      lastUpdate,
      // position,
    } = assignment;

    const assignmentData = new FormData();

    // in the quotation marks "file", we refer to the name we assigned in multer single function
    // the 3rd argument is the filename we pass to the backend
    if (typeof filePath === 'object') {
      assignmentData.append('filePath', filePath, title);
      assignmentData.append('fileType', filePath.type);
    } else {
      assignmentData.append('filePath', filePath);
      assignmentData.append('title', title);
      assignmentData.append('description', description);
    }

    return this.http.put<{ message: string; fetchedAssignment: Assignment }>(
      `${BACKEND_URL}/${courseId}/assignments/${id}`,
      assignmentData,
      {
        withCredentials: true,
      }
    );
  }

  addAssignment(assignment: Assignment, courseId: string) {
    return (
      this.http
        // generic type definition, to define what is going to be returned from the http request
        .post<{ message: string; createdAssignment: Assignment }>(
          `${BACKEND_URL}/${courseId}/assignments`,
          assignment,
          {
            withCredentials: true,
          }
        )
    );
  }

  onDelete(courseId: string, assignmentId: string) {
    return this.http.delete(
      `${BACKEND_URL}/${courseId}/assignments/${assignmentId}`,
      {
        withCredentials: true,
      }
    );
  }

  downloadAssignment(
    filePath: string,
    courseId: string,
    assignment?: Assignment
  ) {
    console.log(assignment);
    return this.http.post(
      `${BACKEND_URL}/${courseId}/assignments/${assignment.id}/dump`,
      { filePath: filePath },
      { responseType: 'blob' as 'json', withCredentials: true }
    );
  }
}
