import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CommonModule,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { httpsInterceptor } from './shared/interceptors/https.interceptor';
import { ErrorInterceptor } from './shared/interceptors/error-interceptor';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularMaterialModule } from './angular-material.module';
// import { AuthModule } from './auth/auth.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { FooterComponent } from './footer/footer.component';
import { JitsiMeetComponent } from './conference/jitsi-meet/jitsi-meet.componenet';
import { EventsComponent } from './events/events.component';
import { SharedModule } from './shared/shared.module';
import { CoursesComponent } from './courses/courses.component';
import { NewTableLineComponent } from './shared/matDialog/newTableLine/newTableLine.component';
// import { CallDashComponent } from './conference/call-dash/call-dash.component';
// import { ConferenceComponent } from './conference/conference.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    FooterComponent,
    EventsComponent,
    JitsiMeetComponent,
    CoursesComponent,
    NewTableLineComponent,
    // ConferenceComponent,
    // CallDashComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    HttpClientModule,
    AngularMaterialModule,
    // AuthModule,
    FormsModule,
    CommonModule,
    SharedModule,
  ],

  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: Window, useValue: window },
    { provide: HTTP_INTERCEPTORS, useClass: httpsInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  // entryComponents: [ErrorComponent],
})
export class AppModule {}
