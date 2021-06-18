import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './courseTableLine.component.html',
})
export class CourseTableLineomponent {
  constructor(
    public sharedService: SharedService,
    public dialogRef: MatDialogRef<CourseTableLineomponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.sharedService.onNoButtonClick();
    this.dialogRef.close();
  }
}
