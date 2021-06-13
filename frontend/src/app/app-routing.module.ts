import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
// import { ConferenceComponent } from './conference/conference.component';
// import { CallDashComponent } from './conference/call-dash/call-dash.component';
import { JitsiMeetComponent } from './conference/jitsi-meet/jitsi-meet.componenet';
import { EventsComponent } from './events/events.component';
import { PdfViewerComponent } from './shared/pdf-viewer/pdf-viewer.component';
import { CoursesComponent } from './courses/courses.component';
import { CourseComponent } from './courses/course/course.component';

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
        path: ':courseId/assignments',
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
      title: 'assignments',
      breadcrumb: [
        {
          label: 'Courses',
          url: 'courses',
        },
        {
          label: '{{ dynamicText }}',
          url: 'courses/:courseId',
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
    path: 'conference',
    // component: ConferenceComponent,
    component: JitsiMeetComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'events',
    component: EventsComponent,
    canActivate: [AuthGuard],
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
