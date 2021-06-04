import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private headerVisibility = new Subject<boolean>();
  private userPhotoPath = new Subject<{
    photo: string;
    name: string;
  }>();

  constructor(private http: HttpClient) {}

  getUserDataSubs() {
    return this.userPhotoPath.asObservable();
  }

  setUserData(imgPath: string, userName: string) {
    this.saveToStorage(imgPath, userName);
    this.userPhotoPath.next({ photo: imgPath, name: userName });
  }

  getUserData() {
    let user = {
      userPhotoPath: localStorage.getItem('userPhotoPath'),
      userName: localStorage.getItem('userName'),
    };

    return user;
  }

  getIsHeaderVisible() {
    return this.headerVisibility.asObservable();
  }

  disableHeader() {
    this.headerVisibility.next(false);
  }

  enableHeader() {
    this.headerVisibility.next(true);
  }

  // saves a given date and photo path in the local storage of the browser
  private saveToStorage(imgPath: string, userName: string) {
    localStorage.setItem('userPhotoPath', imgPath);
    localStorage.setItem('userName', userName);
  }

  updateUserRole(role: string) {
    return this.http.get<{
      message: string;
      existingUser;
    }>(environment.AUTH_BASE_URL + `/api/users/become-${role}`, {
      withCredentials: true,
    });
  }
}
