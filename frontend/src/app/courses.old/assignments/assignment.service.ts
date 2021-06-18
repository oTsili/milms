import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Assignment } from '../../models/assignment.model';
import { Course } from '../../models/course.model';

const BACKEND_URL = environment.ASSIGNMENT_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class AssignmentsService {
  private assignments: Assignment[] = [];
  private editableAssignments: boolean[] = [false];
  private filePickedAssignments: boolean[] = [false];
  private submittedAssignments: boolean[] = [false];
  private assignmentId: string;

  private assignmentIdListener = new Subject<string>();
  private submitListener = new Subject<boolean[]>();
  private filePickedListener = new Subject<boolean[]>();
  private editButtonListener = new Subject<boolean[]>();
  private assignmentsUpdated = new Subject<{
    assignments: Assignment[];
    assignmentCount: number;
  }>();

  constructor(private http: HttpClient) {}

  getAssignmentIdListener() {
    return this.assignmentIdListener.asObservable();
  }

  onAssignmentIdUpdate(updatedAssignmentId) {
    this.assignmentIdListener.next(updatedAssignmentId);
  }
  getFilePickedListener() {
    return this.filePickedListener.asObservable();
  }

  onFilePicked(assignmentIndex: number) {
    this.filePickedAssignments[assignmentIndex] = true;
    this.filePickedListener.next(this.filePickedAssignments);
  }

  resetFilePicked() {
    this.filePickedAssignments = [false];
    this.filePickedListener.next(this.filePickedAssignments);
  }

  getSubmitListener() {
    return this.submitListener.asObservable();
  }

  onSubmitted(assignmentIndex: number) {
    this.submittedAssignments[assignmentIndex] = true;
    this.submitListener.next(this.submittedAssignments);
  }

  disableSubmit(assignmentIndex: number) {
    this.submittedAssignments[assignmentIndex] = false;
    this.submitListener.next(this.submittedAssignments);
  }

  getEditListener() {
    return this.editButtonListener.asObservable();
  }

  enableEdit(assignmentIndex: number, assignmentsLength: number) {
    this.editableAssignments[assignmentIndex] = true;
    this.editButtonListener.next(this.editableAssignments);
  }

  disableEdit(assignmentIndex: number, assignmentsLength: number) {
    this.editableAssignments[assignmentIndex] = false;
    this.editButtonListener.next(this.editableAssignments);
  }

  getAssignmentUpdateListener() {
    return this.assignmentsUpdated.asObservable();
  }

  // getAssignment(Assignment_id: string) {
  //   return this.http.get<{
  //     description: string;
  //     creator: string;
  //     filePath: string;
  //     fileType: string;
  //     id: string;
  //     title: string;
  //     lastUpdate: string;
  //   }>(BACKEND_URL + Assignment_id, {
  //     withCredentials: true,
  //   });
  // }

  informAboutAssignmentUpdate(transformedAssignmentsData) {
    this.assignmentsUpdated.next({
      assignments: [...this.assignments],
      assignmentCount: transformedAssignmentsData.maxAssignments,
    });
  }

  getAssignments(
    assignmentsPerPage: number,
    currentPage: number,
    courseId: string,
    sort: string = ''
  ) {
    const queryParams = `?pagesize=${assignmentsPerPage}&page=${currentPage}&sort=${sort}`;

    return this.http
      .get<{ message: string; course: any; maxAssignments: number }>(
        `${BACKEND_URL}/${courseId}/assignments/${queryParams}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((courseData) => {
          return {
            assignments: courseData.course.assignments.map((assignment) => {
              return {
                courseId: assignment.courseId,
                title: assignment.title,
                description: assignment.description,
                id: assignment.id,
                filePath: assignment.filePath,
                fileType: assignment.fileType,
                lastUpdate: assignment.lastUpdate,
                userName: `${courseData.course.instructorId.firstName} ${courseData.course.instructorId.lastName}`,
                materials: assignment.materials,
                studentDeliveries: assignment.studentDeliveries,
              };
            }),
            maxAssignments: courseData.maxAssignments,
          };
        })
      );
  }

  addAssignment(currentAssignment: Assignment) {
    const { title, description, lastUpdate, filePath } = currentAssignment;

    const assignmentData: FormData = new FormData();

    assignmentData.append('title', title);
    assignmentData.append('description', description);
    // in the quotation marks "file", we refer to the name we assigned in multer single function
    // the 3rd argument is the filename we pass to the backend
    assignmentData.append('filePath', filePath as File, title);
    assignmentData.append('fileType', (filePath as File).type);
    assignmentData.append('lastUpdate', lastUpdate);

    // const params = new HttpParams();

    const options = {
      // params,
      // reportProgress: true,
      withCredentials: true,
    };

    return (
      this.http
        // generic type definition, to define what is going to be returned from the http request
        .post<{ message: string; updatedCourse: Course }>(
          `${BACKEND_URL}/${currentAssignment.courseId}/assignments`,
          assignmentData,
          options
        )
    );
  }

  updateAssignment(currentAssignment: Assignment) {
    const { id, title, description, filePath, fileType, lastUpdate, courseId } =
      currentAssignment;

    let assignmentData: Assignment | FormData;
    // only the file has type object- if updating only the text inputs, the type will be string
    if (typeof filePath === 'object') {
      assignmentData = new FormData();
      assignmentData.append('id', id);
      assignmentData.append('title', title);
      assignmentData.append('description', description);
      if (fileType) {
        assignmentData.append('fileType', fileType);
      }
      assignmentData.append('filePath', filePath, title);
      assignmentData.append('lastUpdate', lastUpdate);
    } else {
      assignmentData = {
        id,
        title,
        description,
        filePath,
        fileType,
        lastUpdate,
        courseId,
      };
    }

    return this.http.put<{ message: string; updatedAssignment: Assignment }>(
      `${BACKEND_URL}/${currentAssignment.courseId}/assignments/${id}`,
      assignmentData,
      {
        withCredentials: true,
      }
    );
  }

  deleteAssignment(assignment: Assignment, assignmentId: string) {
    return this.http.delete(
      `${BACKEND_URL}/${assignment.courseId}/assignments/${assignmentId}`,
      {
        withCredentials: true,
      }
    );
  }

  downloadAssignment(filePath: string, assignment?: Assignment) {
    return this.http.post(
      `${BACKEND_URL}/${assignment.courseId}/assignments/${assignment.id}/dump`,
      { filePath: filePath },
      { responseType: 'blob' as 'json', withCredentials: true }
    );
  }

  // for reading doc files
  readFile(filePath: string) {
    return this.http.post(
      `${BACKEND_URL}/fetch`,
      { filePath: filePath },
      {
        responseType: 'blob',
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
      }
    );
  }
}
