import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assignment } from 'src/app/models/assignment.model';
import { environment } from 'src/environments/environment';
import { MatBreadcrumbService } from 'mat-breadcrumb';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { AssignmentsService } from 'src/app/courses/course/assignments/assignments.service';
import { Course } from 'src/app/models/course.model';
import { CoursesService } from 'src/app/courses/courses.service';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css'],
})
export class AssignmentComponent implements OnInit, OnDestroy {
  userRoleSubscription: Subscription;
  courseId: string;
  assignmentId: string;
  assignment: Assignment;
  isLoading: boolean = false;
  userRole: string;
  course: Course;
  totalCourses = environment.TOTAL_COURSES;
  coursesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    private matBreadcrumbService: MatBreadcrumbService,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private assignmentsService: AssignmentsService,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
        this.assignmentId = paraMap.get('courseId');
      } else {
        // throw new Error('no course id provided');
        console.log('no course id provided');
      }
    });
    // enable the page breadcrumb
    this.sharedService.enableBreadcrumb(true);

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId') && paraMap.has('assignmentId')) {
        this.courseId = paraMap.get('courseId');
        this.assignmentId = paraMap.get('assignmentId');
      } else {
        throw new Error('Either courseId or assignmentId are provided');
      }
    });

    this.assignmentsService
      .getAssignment(this.courseId, this.assignmentId)
      .subscribe((response) => {
        this.assignment = response.assignment;
        this.updateMatBreadcrumb(this.assignment);
      });

    this.sharedService.getUserRole().subscribe((response) => {
      this.userRole = response.userRole;
    });
    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        this.userRole = response;
      });
  }

  ngOnDestroy() {
    this.userRoleSubscription.unsubscribe();
  }

  updateMatBreadcrumb(assignment: Assignment) {
    this.coursesService
      .getCourse(assignment.courseId as string)
      .subscribe((response) => {
        this.course = response.course;
        const breadcrumb = {
          customText: 'This is Custom Text',
          assignmentText: this.assignment.title,
          courseText: this.course.title,
        };

        this.matBreadcrumbService.updateBreadcrumbLabels(breadcrumb);
      });

    // get course NO COURSES and update the dynamic text with the course title
  }

  onGetAssignment(courseId: string, assignmentId: string) {
    return this.assignmentsService.getAssignment(courseId, assignmentId);
  }
}
