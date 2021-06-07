import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { Assignment } from '../../../../models/assignment.model';
import {
  StudentDeliveryAssignment,
  StudentDeliveryFile,
} from 'src/app/models/student-delivery.model';
import { Subject } from 'rxjs';
import { FormArray, FormControl } from '@angular/forms';

const BACKEND_URL = environment.ASSIGNMENT_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class StudentDeliveriesService {
  private studentDeliveries: StudentDeliveryAssignment[] = [];
  private studentDeliveriesListener = new Subject<StudentDeliveryFile[]>();

  constructor(private http: HttpClient) {}

  getStudentDeliveriesListener() {
    return this.studentDeliveriesListener.asObservable();
  }

  onStudentDeliveriesUpdate(studentDeliveries) {
    this.studentDeliveriesListener.next(studentDeliveries);
  }

  getAssignmentStudentDeliveriesFiles(courseId: string, assignmentId: string) {
    return this.http
      .get<{
        message: string;
        fetchedStudentDeliveryFiles: StudentDeliveryFile[];
        countStudentDeliveryFile: number;
      }>(
        `${BACKEND_URL}/${courseId}/assignments/${assignmentId}/all-student-deliveries`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((studentDiliveriesData) => {
          console.log(studentDiliveriesData);

          if (studentDiliveriesData.fetchedStudentDeliveryFiles) {
            return {
              studentDeliveryFiles:
                studentDiliveriesData.fetchedStudentDeliveryFiles.map(
                  (delivery) => {
                    return {
                      id: delivery.id,
                      name: delivery.name,
                      lastUpdate: delivery.lastUpdate,
                      filePath: delivery.filePath,
                      fileType: delivery.fileType,
                      studentId: delivery.studentId,
                      assignmentId: delivery.assignmentId,
                      studentDeliveryAssignmentId:
                        delivery.studentDeliveryAssignmentId,
                    };
                  }
                ),
              totalDeliveries: studentDiliveriesData.countStudentDeliveryFile,
            };
          }
          // if there are no any materials yet in the assigment
          return null;
        })
      );
  }

  getMyStudentDeliveryFiles(courseId: string, assignmentId: string) {
    console.log(courseId, assignmentId);
    return this.http
      .get<{
        message: string;
        fetchedMyStudentDeliveryFiles: StudentDeliveryFile[];
        maxDeliveryFiles: number;
      }>(
        `${BACKEND_URL}/${courseId}/assignments/${assignmentId}/my-student-delivery`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((myStudentDeliveryFilesData) => {
          console.log(myStudentDeliveryFilesData);

          return {
            studentDeliveryFiles:
              myStudentDeliveryFilesData.fetchedMyStudentDeliveryFiles.map(
                (deliveryFile) => {
                  return {
                    id: deliveryFile.id,
                    name: deliveryFile.name,
                    lastUpdate: deliveryFile.lastUpdate,
                    filePath: deliveryFile.filePath,
                    fileType: deliveryFile.fileType,
                    assignmentId: deliveryFile.assignmentId,
                    studentDeliveryAssignmentId:
                      deliveryFile.studentDeliveryAssignmentId,
                    studentId: deliveryFile.studentId,
                  };
                }
              ),
            totalDeliveries: myStudentDeliveryFilesData.maxDeliveryFiles,
          };
        })
      );
  }

  addStudentDeliveryFiles(
    currentAssignment: Assignment,
    currentStudentDeliveryControl: FormArray
  ) {
    const { id, courseId, lastUpdate } = currentAssignment;

    const studentDeliveryData = new FormData();

    studentDeliveryData.append('courseId', courseId as string);
    studentDeliveryData.append('assignmentId', id);
    studentDeliveryData.append('lastUpdate', lastUpdate);

    // overpass the previously saved files in the db begining from the index of their number
    for (let i = 0; i < currentStudentDeliveryControl.length; i++) {
      let studentDeliveryFile = currentStudentDeliveryControl.value[i];

      if (!studentDeliveryFile.studentId) {
        studentDeliveryData.append(
          'lastUpdates[]',
          (studentDeliveryFile as StudentDeliveryFile).lastUpdate
        );
        studentDeliveryData.append(
          'names[]',
          (studentDeliveryFile as StudentDeliveryFile).name
        );
        studentDeliveryData.append(
          'fileTypes[]',
          (studentDeliveryFile as StudentDeliveryFile).fileType
        );
        studentDeliveryData.append(
          'filePaths[]',
          (studentDeliveryFile as StudentDeliveryFile).filePath,
          studentDeliveryFile.name.split('.')[0]
        );
      }
    }

    // const params = new HttpParams();

    const options = {
      // params,
      // reportProgress: true,
      withCredentials: true,
    };

    return (
      this.http
        // generic type definition, to define what is going to be returned from the http request
        .post<{
          message: string;
          studentDeliveryFiles: StudentDeliveryFile[];
        }>(
          `${BACKEND_URL}/${courseId}/assignments/${id}/student-deliveries`,
          studentDeliveryData,
          options
        )
        .pipe(
          map((studentDeliveryFileData) => {
            return {
              studentDeliveryFiles:
                studentDeliveryFileData.studentDeliveryFiles.map(
                  (deliveryFile) => {
                    return {
                      id: deliveryFile.id,
                      name: deliveryFile.name,
                      lastUpdate: deliveryFile.lastUpdate,
                      filePath: deliveryFile.filePath,
                      fileType: deliveryFile.fileType,
                      assignmentId: deliveryFile.assignmentId,
                    };
                  }
                ),
            };
          })
        )
    );
  }

  deleteStudentDeliveryAssignment(
    studentDeliveryAssignment: StudentDeliveryAssignment
  ) {
    console.log('studentDelivery: ', studentDeliveryAssignment);

    return this.http.delete(
      `${BACKEND_URL}/${studentDeliveryAssignment.courseId}/assignments
      /${studentDeliveryAssignment.assignmentId}/all-student-deliveries
      /${studentDeliveryAssignment.id}`.replace(/\s/g, ''),
      {
        withCredentials: true,
      }
    );
  }

  deleteStudentDeliveryFile(
    courseId: string,
    assignmentId: string,
    studentDeliveryFile: StudentDeliveryFile
  ) {
    console.log('studentDelivery: ', studentDeliveryFile);

    return this.http.delete(
      `${BACKEND_URL}/${courseId}/assignments
      /${assignmentId}/student-delivery-files
      /${studentDeliveryFile.id}`.replace(/\s/g, ''),
      {
        withCredentials: true,
      }
    );
  }

  downloadStudentDeliveryFile(
    courseId: string,
    assignmentId: string,
    studentDeliveryFile: StudentDeliveryFile
  ) {
    const filePath = (studentDeliveryFile.filePath as string)
      .split('/')
      .slice(-1)
      .pop();

    return this.http.post(
      `${BACKEND_URL}/${courseId}/assignments
      /${assignmentId}/student-delivery-files
      /${studentDeliveryFile.id}/dump`.replace(/\s/g, ''),
      { filePath },
      { responseType: 'blob' as 'json', withCredentials: true }
    );
  }
}
