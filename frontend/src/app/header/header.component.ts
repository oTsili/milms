import { environment } from './../../environments/environment';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription, SubscriptionLike } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { SharedService } from '../shared/services/shared.service';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  headerIsVisible = true;
  private authListenerSubs: Subscription;
  private visibilitySubs: Subscription;
  private userDataSubs: Subscription;
  userPhotoSrc: string;
  usrName: string = '';

  constructor(
    private authService: AuthService,
    private headerService: HeaderService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // get the authentication state from the frontend (not the backend)
    this.userIsAuthenticated = this.authService.getIsAuth(true);
    this.visibilitySubs = this.headerService
      .getIsHeaderVisible()
      .subscribe((isVisible) => {
        this.headerIsVisible = isVisible;
      });

    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });

    this.userDataSubs = this.headerService
      .getUserDataSubs()
      .subscribe((response) => {
        this.userPhotoSrc = response.photo;
        this.usrName = response.name;
      });
    if (!this.userPhotoSrc) {
      const user = this.headerService.getUserData();
      this.userPhotoSrc = user.userPhotoPath;
      this.usrName = user.userName;
    }
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.visibilitySubs.unsubscribe();
    this.userDataSubs.unsubscribe();
  }

  onUserRoleUpdate(role: string) {
    this.headerService.updateUserRole(role).subscribe((response) => {
      this.sharedService.onUserRoleUpdate(role);
    });
  }
}
