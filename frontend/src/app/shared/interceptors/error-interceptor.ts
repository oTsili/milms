import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '../../error/error.component';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errors: { message: string }[] = [
          { message: 'An unknown error occured!' },
        ];
        if (error) {
          console.log(error);
          errors = [{ message: error.error.message }];
        }

        if (error.error.errors) {
          if (error.error.errors.length > 0) {
            errors = error.error.errors;
          }
        }
        this.dialog.open(ErrorComponent, { data: errors });
        return throwError(error);
      })
    );
  }
}
