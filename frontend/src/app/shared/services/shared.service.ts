import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../matDialog/error/error.component';
import { NotificationComponent } from '../matDialog/notification/notification.component';

@Injectable({ providedIn: 'root' })
export class SharedService {
  constructor(private http: HttpClient, private dialog: MatDialog) {}

  private breadcrumbIsEnabled = new Subject<boolean>();
  private userRoleListener = new Subject<string>();
  private NoButtonListener = new Subject<boolean>();
  private userRole: string = '';

  getBreadcrumbDisability(): Observable<boolean> {
    return this.breadcrumbIsEnabled.asObservable();
  }
  enableBreadcrumb(enable: boolean) {
    this.breadcrumbIsEnabled.next(enable);
  }
  getNoButtonListener(): Observable<boolean> {
    return this.NoButtonListener.asObservable();
  }
  onNoButtonClick() {
    this.NoButtonListener.next(true);
  }

  toHumanDateTime(providedDate: string) {
    const date = new Date(providedDate);

    const month = (date.getMonth() + 1).toString();

    const newDateArray = date.toDateString().split(' ');
    // delete the day name
    newDateArray.splice(0, 1);
    // change the month name to month numbers
    newDateArray.splice(0, 1, month);
    // monve the month to the center
    this.monveInArray(newDateArray, 0, 1);
    const newDate = newDateArray.join(' ').replace(/\ /g, '/');
    const newTime = date.toTimeString().split(' ')[0];

    return `${newDate} ${newTime}`;
  }

  monveInArray(arr: string[], from: number, to: number): void {
    let item = arr.splice(from, 1);

    arr.splice(to, 0, item[0]);
  }

  getUserRoleListener() {
    return this.userRoleListener.asObservable();
  }

  getUserRole() {
    return this.http.get<{
      userRole: string;
    }>(`${environment.AUTH_BASE_URL}/api/courses/user/user-role`, {
      withCredentials: true,
    });
  }

  onUserRoleUpdate(role: string) {
    this.userRoleListener.next(role);
  }

  throwError(error: string) {
    let currentError = [
      {
        message: error,
      },
    ];
    this.dialog.open(ErrorComponent, { data: currentError });
  }

  throwNotification(error: string) {
    let currentError = [
      {
        message: error,
      },
    ];
    this.dialog.open(NotificationComponent, { data: currentError });
  }
}
