import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private authStatusSub: Subscription;
  userIsAuthenticated: boolean = false;

  constructor(
    public authService: AuthService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.sharedService.enableBreadcrumb(false);
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
    this.userIsAuthenticated = this.authService.getIsLoggedIn();
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      console.log('form invalid');
      return;
    }
    this.isLoading = true;
    this.authService.login(form.value.email, form.value.password);
    this.isLoading = false;
    // this.isLoading = false;
    this.authService
      .getAuthStatusListener()
      .subscribe((authStstus) => (this.isLoading = false));
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
