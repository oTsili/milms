import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';

import { environment } from 'src/environments/environment';
import { Material } from 'src/app/models/material.model';
import { Assignment } from 'src/app/models/assignment.model';
import { Course } from 'src/app/models/course.model';
import { SharedService } from 'src/app/shared/services/shared.service';
import { StudentDeliveryFile } from 'src/app/models/student-delivery.model';

const BACKEND_URL = environment.ASSIGNMENT_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class StudentDeliveriesService {
  private studentDeliveries: StudentDeliveryFile[] = [];

  private studentDeliveriesListener = new Subject<StudentDeliveryFile[]>();
  private studentDeliveriesUpdated = new Subject<{
    studentDeliveries: StudentDeliveryFile[];
    studentDeliveriesCount: number;
  }>();

  constructor(private http: HttpClient) {}

  getStudentDeliverieslListener() {
    return this.studentDeliveriesListener.asObservable();
  }

  onStudentDeliveriesUpdate(studentDeliveries: StudentDeliveryFile[]) {
    console.log('student deliveries updated');
    this.studentDeliveriesListener.next(studentDeliveries);
  }

  getStudentDeliveries(
    coursesPerPage: number,
    currentPage: number,
    courseId: string,
    assignmentId: string,
    sort: string | Sort = ''
  ) {
    const queryParams = `?pagesize=${coursesPerPage}&page=${currentPage}&sort=${sort}`;
    return this.http
      .get<{
        message: string;
        fetchedStudentDeliveryFiles: any;
        countStudentDeliveryFile: number;
      }>(
        `${BACKEND_URL}/${courseId}/assignments/${assignmentId}/student-deliveries${queryParams}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((studentDeliveriesData) => {
          console.log(studentDeliveriesData);
          if (studentDeliveriesData.fetchedStudentDeliveryFiles) {
            return {
              studentDeliveries:
                studentDeliveriesData.fetchedStudentDeliveryFiles.map(
                  (studentDelivery, index) => {
                    const studentName = `${studentDelivery.studentId.firstName} ${studentDelivery.studentId.lastName}`;
                    return {
                      position:
                        (currentPage - 1) * coursesPerPage + (index + 1),
                      name: studentDelivery.name,
                      filePath: studentDelivery.filePath,
                      fileType: studentDelivery.fileType,
                      lastUpdate: studentDelivery.lastUpdate,
                      assignmentId: studentDelivery.assignmentId,
                      courseId: studentDelivery.courseId,
                      id: studentDelivery.id,
                      studentId: studentDelivery.studentId,
                      studentName,
                    };
                  }
                ),
              maxStudentDeliveries:
                studentDeliveriesData.countStudentDeliveryFile,
            };
          }
          // if there are no any studentDelivery yet in the assigment
          return null;
        })
      );
  }

  addStudentDeliveries(
    courseId: string,
    assignmentId: string,
    studentDeliveriesControl: FormArray
  ) {
    const studentDeliveriesData = new FormData();

    studentDeliveriesData.append('courseId', courseId as string);
    studentDeliveriesData.append('assignmentId', assignmentId as string);

    // overpass the previously saved files in the db begining from the index of their number
    for (let i = 0; i < studentDeliveriesControl.length; i++) {
      let studentDeliveryFile = studentDeliveriesControl.value[i];

      if (!studentDeliveryFile.creatorId) {
        studentDeliveriesData.append(
          'lastUpdates[]',
          (studentDeliveryFile as StudentDeliveryFile).lastUpdate
        );
        studentDeliveriesData.append(
          'names[]',
          (studentDeliveryFile as StudentDeliveryFile).name
        );
        studentDeliveriesData.append(
          'fileTypes[]',
          (studentDeliveryFile as StudentDeliveryFile).fileType
        );
        studentDeliveriesData.append(
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
          fetchedStudentDeliveryFiles: StudentDeliveryFile[];
        }>(
          `${BACKEND_URL}/${courseId}/assignments/${assignmentId}/student-deliveries`,
          studentDeliveriesData,
          options
        )
        .pipe(
          map((studentDeliveriesFileData) => {
            return {
              fetchedStudentDeliveryFiles:
                studentDeliveriesFileData.fetchedStudentDeliveryFiles.map(
                  (studentDeliveriesFile) => {
                    return {
                      id: studentDeliveriesFile.id,
                      name: studentDeliveriesFile.name,
                      lastUpdate: studentDeliveriesFile.lastUpdate,
                      filePath: studentDeliveriesFile.filePath,
                      fileType: studentDeliveriesFile.fileType,
                      courseId: studentDeliveriesFile.courseId,
                      assignmentId: studentDeliveriesFile.assignmentId,
                    };
                  }
                ),
            };
          })
        )
    );
  }

  updateStudentDeliveries(currentStudentDelivery: StudentDeliveryFile) {
    const { id, name, filePath, fileType, lastUpdate, assignmentId, courseId } =
      currentStudentDelivery;

    let studentDeliveriesData: StudentDeliveryFile | FormData;
    // only the file has type object- if updating only the text inputs, the type will be string
    if (typeof filePath === 'object') {
      studentDeliveriesData = new FormData();
      studentDeliveriesData.append('name', name);
      // in the quotation marks "file", we refer to the name we assigned in multer single function
      // the 3rd argument is the filename we pass to the backend
      studentDeliveriesData.append(
        'filePath',
        filePath as File,
        name.split('.')[0]
      );
      studentDeliveriesData.append('fileType', (filePath as File).type);
      studentDeliveriesData.append('lastUpdate', lastUpdate);
      studentDeliveriesData.append('assignmentId', assignmentId as string);
      studentDeliveriesData.append('courseId', courseId);
    } else {
      studentDeliveriesData = {
        id,
        name,
        filePath,
        fileType,
        lastUpdate,
        courseId,
        assignmentId: assignmentId as string,
      };
    }

    return this.http.put<{
      message: string;
      updatedStudentDelivery: StudentDeliveryFile;
    }>(
      `${BACKEND_URL}/${currentStudentDelivery.courseId}/assignments/${assignmentId}/student-deliveries`,
      studentDeliveriesData,
      {
        withCredentials: true,
      }
    );
  }

  deleteStudentDelivery(studentDelivery: StudentDeliveryFile) {
    return this.http.delete(
      `${BACKEND_URL}/${studentDelivery.courseId}/assignments/${studentDelivery.assignmentId}/student-deliveries/${studentDelivery.id}`,
      {
        withCredentials: true,
      }
    );
  }

  downloadStudentDelivery(studentDelivery: StudentDeliveryFile) {
    const filePath = (studentDelivery.filePath as string)
      .split('/')
      .slice(-1)
      .pop();
    return this.http.post(
      `${BACKEND_URL}/${studentDelivery.courseId}/assignments/${studentDelivery.assignmentId}/student-deliveries/${studentDelivery.id}/dump`,
      { filePath },
      { responseType: 'blob' as 'json', withCredentials: true }
    );
  }

  //   // for reading doc files
  //   readFile(filePath: string) {
  //     return this.http.post(
  //       `${BACKEND_URL}/fetch`,
  //       { filePath: filePath },
  //       {
  //         responseType: 'blob',
  //         headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  //         withCredentials: true,
  //       }
  //     );
  //   }
}
