import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { imgMimeType } from 'src/app/shared/validators/image-mime-type.validator';

import { AuthService } from '../auth.service';
import { RetypeConfirm } from '../../shared/validators/password-confirm-validator';
import { HeaderService } from 'src/app/header/header.service';
import { SignupAuthData } from '../../models/auth-data.model';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private authStatusSub: Subscription;
  theSignupForm: FormGroup;
  imagePreview: string;
  file: File;
  fileTitle: string;
  signupDate: string;

  constructor(
    public authService: AuthService,
    public route: ActivatedRoute,
    public headerService: HeaderService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.sharedService.enableBreadcrumb(false);
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
    this.theSignupForm = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      firstName: new FormControl(null, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(null, {
        validators: [Validators.required],
      }),
      photoPath: new FormControl(null, {
        // validators: [Validators.required],
        asyncValidators: [imgMimeType],
      }),
      passwordsForm: new FormGroup({
        password: new FormControl(null, {
          validators: [Validators.required],
        }),
        passwordConfirm: new FormControl(null, {
          validators: [Validators.required, RetypeConfirm('password')],
        }),
      }),
    });
  }

  onImagePicked(event: Event) {
    // get the file
    const file = (event.target as HTMLInputElement).files[0];
    // change the value of a single form field
    this.theSignupForm.patchValue({ photoPath: file });
    // update and validate the image field value
    this.theSignupForm.get('photoPath').updateValueAndValidity();

    // convert the file to data-url in order to be used in src property on image element
    const reader = new FileReader();
    reader.onload = () => {
      // get the current date
      var m = new Date();
      var dateString = `${m.getUTCFullYear()}/${
        m.getUTCMonth() + 1
      }/${m.getUTCDate()} ${String(
        m.getUTCHours() + 2
      )}:${m.getUTCMinutes()}:${m.getUTCSeconds()}`;

      this.signupDate = dateString;
      this.fileTitle = file.name;
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      console.log('invalid form');
      return;
    }

    // get the current date
    var m = new Date();
    var dateString = `${m.getUTCFullYear()}/${
      m.getUTCMonth() + 1
    }/${m.getUTCDate()} ${String(
      m.getUTCHours() + 2
    )}:${m.getUTCMinutes()}:${m.getUTCSeconds()}`;

    this.signupDate = dateString;

    this.isLoading = true;

    const user: SignupAuthData = {
      email: form.value.email,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      file: form.value.photoPath,
      signupDate: this.signupDate,
      password: form.value.passwordsForm.password,
      passwordConfirm: form.value.passwordsForm.passwordConfirm,
    };

    this.authService.createUser(user);
    const fotoPath = user.file
      ? this.imagePreview
      : '/assets/images/users/default.jpg';
    this.headerService.setUserData(
      fotoPath,
      `${form.value.firstName} ${form.value.lastName}`
    );
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
