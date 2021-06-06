import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './error.component.html',
})
export class ErrorComponent {
  // message = 'An unknown error occurred!';
  constructor(@Inject(MAT_DIALOG_DATA) public errors: { message: string }[]) {}
}
