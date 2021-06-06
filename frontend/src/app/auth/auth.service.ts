import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  LoginAuthData,
  SignupAuthData,
  User,
  UserAttrs,
} from '../models/auth-data.model';
import { environment } from '../../environments/environment';
import { UserPayload } from '../models/auth-data.model';
import { HeaderService } from 'src/app/header/header.service';
import { SharedService } from '../shared/services/shared.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private userId: string;
  private tokenTimer: NodeJS.Timer;
  user: UserPayload;

  constructor(
    private http: HttpClient,
    private router: Router,
    private headerService: HeaderService,
    private sharedService: SharedService
  ) {}

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsLoggedIn() {
    return this.isAuthenticated;
    // console.log(this.authStatusListener);
  }

  getUserId() {
    return this.userId;
  }

  // get auth by requesting to the node server
  getIsAuth(local: boolean = false) {
    if (local) {
      return this.isAuthenticated;
    }

    this.http
      .get(environment.AUTH_BASE_URL + '/api/users/currentuser', {
        withCredentials: true,
      })
      .subscribe(
        (data) => {
          // if authenticated, the api returns the current user
          if (Object.keys(data).length > 0) {
            this.isAuthenticated = true;
            this.authStatusListener.next(true);
          } else {
            // if not authenticated, the api returns an empty object
            this.isAuthenticated = false;
            this.authStatusListener.next(false);
          }
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
    return this.isAuthenticated;
  }

  createUser(signupAuthData: SignupAuthData) {
    const authData = new FormData();
    authData.append('email', signupAuthData.email);
    authData.append('firstName', signupAuthData.firstName);
    authData.append('lastName', signupAuthData.lastName);
    // in the quotation marks "file", we refer to the name we assigned in multer single function
    // the 3rd argument is the filename we pass to the backend
    if (signupAuthData.file) {
      authData.append(
        'photoPath',
        signupAuthData.file,
        signupAuthData.firstName
      );
    }
    authData.append('signupDate', signupAuthData.signupDate);
    authData.append('password', signupAuthData.password);
    authData.append('passwordConfirm', signupAuthData.passwordConfirm);

    this.http
      .post<{ existingUser: UserAttrs; expiresIn: string }>(
        environment.AUTH_BASE_URL + '/api/users/signup',
        authData,
        {
          withCredentials: true,
        }
      )
      .subscribe(
        (data) => {
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.userId = data.existingUser.id;
          this.router.navigate(['/']);
          let duration = parseInt(data.expiresIn);
          this.setAuthTimer(duration);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + duration * 1000);
          this.saveToStorage(expirationDate);
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
  }

  login(email: string, password: string) {
    const authData: LoginAuthData = { email, password };
    this.http
      .post(environment.AUTH_BASE_URL + '/api/users/signin', authData, {
        withCredentials: true,
      })
      .subscribe((data: { existingUser: User; expiresIn: string }) => {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.router.navigate(['/']);
        this.userId = data.existingUser.id;
        this.headerService.setUserData(
          data.existingUser.photoPath,
          `${data.existingUser.firstName} ${data.existingUser.lastName}`
        );
        let duration = parseInt(data.expiresIn);
        this.setAuthTimer(duration);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + duration * 1000);
        this.saveToStorage(expirationDate);
      });
  }

  logout() {
    this.http
      .get(environment.AUTH_BASE_URL + '/api/users/signout', {
        withCredentials: true,
      })
      .subscribe(
        (data) => {
          this.isAuthenticated = false;
          this.authStatusListener.next(false);
          this.userId = null;
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearFromStorage();
  }

  // compare the expiration time with the current time and decide if the user is authenticated
  autoAuthUser() {
    const expiration = this.getTokenTimer();
    const now = new Date();
    if (expiration) {
      const expiresIn = expiration.expirationDate.getTime() - now.getTime();
      if (expiresIn > 0) {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.setAuthTimer(expiresIn / 1000);
      }
    }
  }

  // save to the class var tokenTimer the timer to expire the token
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.sharedService.throwNotification(
        'Your session has expired. Please login again.'
      );
      this.logout();
    }, duration * 1000);
  }

  //gets the value of the 'expiration' variable stored in the browser's local storage
  private getTokenTimer() {
    const expiration = new Date(localStorage.getItem('expiration'));
    if (!expiration) {
      return;
    }
    return { expirationDate: new Date(expiration) };
  }

  // saves a given date and photo path in the local storage of the browser
  private saveToStorage(expirationDate: Date) {
    localStorage.setItem('expiration', this.toISOLocal(expirationDate));
  }

  // clears the local storage of the browser
  private clearFromStorage() {
    localStorage.removeItem('expiration');
    localStorage.removeItem('userPhotoPath');
    localStorage.removeItem('userName');
  }

  // converts a date of time-zone 0 to the time-zone registered in the browser
  toISOLocal(d) {
    var z = (n) => ('0' + n).slice(-2);
    var zz = (n) => ('00' + n).slice(-3);
    var off = d.getTimezoneOffset();
    var sign = off < 0 ? '+' : '-';
    off = Math.abs(off);

    return (
      d.getFullYear() +
      '-' +
      z(d.getMonth() + 1) +
      '-' +
      z(d.getDate()) +
      'T' +
      z(d.getHours()) +
      ':' +
      z(d.getMinutes()) +
      ':' +
      z(d.getSeconds()) +
      '.' +
      zz(d.getMilliseconds()) +
      sign +
      z((off / 60) | 0) +
      ':' +
      z(off % 60)
    );
  }
}
