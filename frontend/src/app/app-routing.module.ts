import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
// import { ConferenceComponent } from './conference/conference.component';
// import { CallDashComponent } from './conference/call-dash/call-dash.component';
import { JitsiMeetComponent } from './jitsi-meet/jitsi-meet.component';
import { PdfViewerComponent } from './shared/pdf-viewer/pdf-viewer.component';
import { CoursesComponent } from './courses/courses.component';
import { CourseComponent } from './courses/course/course.component';
import { AssignmentComponent } from './courses/course/assignments/assignment/assignment.component';
import { EventsComponent } from './events/events.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'courses',
    component: CoursesComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'courses',
      breadcrumb: [
        {
          label: 'Courses',
          url: 'courses',
        },
      ],
    },
    children: [
      {
        path: ':courseId',
        redirectTo: 'courses/:courseId',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'courses/:courseId',
    component: CourseComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'course',
      breadcrumb: [
        {
          label: 'Courses',
          url: 'courses',
        },
        {
          label: '{{dynamicText}}',
          url: 'courses/:courseId',
        },
      ],
      children: [
        {
          path: 'meet',
          redirectTo: 'courses/:courseId/meet',
          pathMatch: 'full',
        },
        {
          path: 'assignments/:assignmentId',
          redirectTo: 'courses/:courseId/assignments/:assignmentId',
          pathMatch: 'full',
        },
      ],
    },
  },
  {
    path: 'courses/:courseId/assignments/:assignmentId',
    component: AssignmentComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'assignment',
      breadcrumb: [
        {
          label: 'Courses',
          url: 'courses',
        },
        {
          label: '{{courseText}}',
          url: 'courses/:courseId',
        },
        {
          label: 'Assignment: {{assignmentText}}',
          url: 'assignments/:assignmentId',
        },
      ],
      children: [
        {
          path: 'assignments/:assignmentId',
          redirectTo: 'assignments/:assignmentId',
          pathMatch: 'full',
        },
      ],
    },
  },

  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'pdfViewer/:filePath',
    component: PdfViewerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'courses/:courseId/meet',
    component: JitsiMeetComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'meet',
      breadcrumb: [
        {
          label: 'Courses',
          url: 'courses',
        },
        {
          label: '{{courseText}}',
          url: 'courses/:courseId',
        },
        {
          label: 'Meet',
          url: 'meet',
        },
      ],
    },
  },
  {
    path: 'events',
    component: EventsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Events',
      breadcrumb: [
        {
          label: 'Events',
          url: 'events',
        },
      ],
    },
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
