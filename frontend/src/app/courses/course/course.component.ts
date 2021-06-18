import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBreadcrumbService } from 'mat-breadcrumb';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { CoursesService } from 'src/app/courses/courses.service';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Course } from 'src/app/models/course.model';
@Component({
  selector: 'app-courses',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css', './course.component.scss'],
})
export class CourseComponent implements OnInit, OnDestroy {
  userRoleSubscription: Subscription;
  courseId: string;
  course: Course;
  isLoading: boolean = false;
  userRole: string;
  totalCourses = environment.TOTAL_COURSES;
  coursesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    private matBreadcrumbService: MatBreadcrumbService,
    public route: ActivatedRoute,
    private sharedService: SharedService,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    // enable the page breadcrumb
    this.sharedService.enableBreadcrumb(true);

    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else {
        throw new Error('no course id provided');
      }
    });

    this.updateMatBreadcrumb();

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

  onGetCourse(id: string) {
    return this.coursesService.getCourse(id);
  }

  updateMatBreadcrumb() {
    this.onGetCourse(this.courseId).subscribe((response) => {
      this.course = response.course;

      const breadcrumb = {
        customText: 'This is Custom Text',
        dynamicText: this.course.title,
      };
      this.matBreadcrumbService.updateBreadcrumbLabels(breadcrumb);
    });
    // get course NO COURSES and update the dynamic text with the course title
  }
}
