import { Injectable } from '@angular/core';
import { StudentDeliveryAssignment } from 'src/app/models/student-delivery.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Sort } from '@angular/material/sort';
import { map } from 'rxjs/operators';

const BACKEND_URL = environment.ASSIGNMENT_BASE_URL + '/api/courses';

@Injectable({ providedIn: 'root' })
export class StudentDeliveryAssignmentService {
  studentDeliveryAssignmentsListener = new Subject<
    StudentDeliveryAssignment[]
  >();

  constructor(private http: HttpClient) {}

  getStudentDeliveryAssignmentsListener() {
    return this.studentDeliveryAssignmentsListener.asObservable();
  }

  onStudentDeliveryAssignmentsUpdate(
    studentDeliveryAssignments: StudentDeliveryAssignment[]
  ) {
    console.log('student deliveries updated');
    this.studentDeliveryAssignmentsListener.next(studentDeliveryAssignments);
  }

  getStudentDeliveryAssignments(
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
        fetchedStudentDeliveryAssignments: any;
        countStudentDeliveryAssignment: number;
      }>(
        `${BACKEND_URL}/${courseId}/assignments/${assignmentId}/student-delivery-assignments${queryParams}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((studentDeliveryData) => {
          if (studentDeliveryData.fetchedStudentDeliveryAssignments) {
            return {
              studentDeliveries:
                studentDeliveryData.fetchedStudentDeliveryAssignments.map(
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
                studentDeliveryData.fetchedStudentDeliveryAssignments,
            };
          }
          // if there are no any studentDelivery yet in the assigment
          return null;
        })
      );
  }

  onUpdateStudentDeliveryAssignment(
    studentDeliveryAssignment: StudentDeliveryAssignment
  ) {
    const { id } = studentDeliveryAssignment;

    return this.http.put<{
      message: string;
      updatedStudentDeliveryAssignment: StudentDeliveryAssignment;
    }>(`${BACKEND_URL}/${id}`, studentDeliveryAssignment, {
      withCredentials: true,
    });
  }
}
