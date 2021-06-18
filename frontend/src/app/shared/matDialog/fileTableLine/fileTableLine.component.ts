import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';
import { AbstractControl } from '@angular/forms';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'dialog-file',
  templateUrl: './fileTableLine.component.html',
})
export class fileTableLineComponent {
  currentControl: AbstractControl;
  constructor(
    public sharedService: SharedService,
    public dialogRef: MatDialogRef<fileTableLineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.currentControl = data.currentControl;
  }

  onNoClick(): void {
    this.sharedService.onNoButtonClick();
    this.dialogRef.close();
  }
}
