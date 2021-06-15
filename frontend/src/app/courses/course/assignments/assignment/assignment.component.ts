import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Assignment } from 'src/app/models/assignment.model';
import { environment } from 'src/environments/environment';
import { MatBreadcrumbService } from 'mat-breadcrumb';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { AssignmentsService } from 'src/app/courses/course/assignments/assignments.service';

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
  totalCourses = environment.TOTAL_COURSES;
  coursesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    private matBreadcrumbService: MatBreadcrumbService,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private assignmentsService: AssignmentsService
  ) {}

  ngOnInit() {
    // enable the page breadcrumb
    this.sharedService.enableBreadcrumb(true);

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId') && paraMap.has('assignmentId')) {
        this.courseId = paraMap.get('courseId');
        this.assignmentId = paraMap.get('assignmentId');
      } else {
        throw new Error('no course id provided');
      }
    });

    this.updateMatBreadcrumb();

    this.sharedService.getUserRole().subscribe((response) => {
      console.log('ngOnInit');
      this.userRole = response.userRole;
      console.log(this.userRole);
    });
    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        console.log(response);
        this.userRole = response;
      });
  }

  ngOnDestroy() {
    this.userRoleSubscription.unsubscribe();
  }

  updateMatBreadcrumb() {
    this.onGetAssignment(this.courseId, this.assignmentId).subscribe(
      (response) => {
        console.log(response);
        this.assignment = response.assignment;

        console.log(this.assignment);
        const breadcrumb = {
          customText: 'This is Custom Text',
          dynamicText: this.assignment.title,
        };
        this.matBreadcrumbService.updateBreadcrumbLabels(breadcrumb);
      }
    );
    // get course NO COURSES and update the dynamic text with the course title
  }

  onGetAssignment(courseId: string, assignmentId: string) {
    return this.assignmentsService.getAssignment(courseId, assignmentId);
  }
}
