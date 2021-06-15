import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'dialog-file',
  templateUrl: './fileTableLine.component.html',
})
export class fileTableLineComponent {
  currentControl: AbstractControl;
  constructor(
    public dialogRef: MatDialogRef<fileTableLineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    console.log(data);
    this.currentControl = data.currentControl;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
