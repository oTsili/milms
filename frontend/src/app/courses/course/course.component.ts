import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBreadcrumbService } from 'mat-breadcrumb';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CoursesService } from '../courses.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css', './courses.component.scss'],
})
export class CourseComponent implements OnInit, OnDestroy {
  courseId: string;
  totalCourses = environment.TOTAL_COURSES;
  coursesPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;

  constructor(
    private matBreadcrumbService: MatBreadcrumbService,
    public route: ActivatedRoute,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paraMap: ParamMap) => {
      if (paraMap.has('courseId')) {
        this.courseId = paraMap.get('courseId');
      } else {
        throw new Error('no course id provided');
      }
    });

    // get course NO COURSES and update the dynamic text with the course title
    const breadcrumb = {
      customText: 'This is Custom Text',
      dynamicText: 'Level 2 ',
    };
    this.matBreadcrumbService.updateBreadcrumbLabels(breadcrumb);
  }
  ngOnDestroy() {}
}
