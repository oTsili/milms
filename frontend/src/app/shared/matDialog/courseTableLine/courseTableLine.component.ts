import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './courseTableLine.component.html',
})
export class CourseTableLineomponent {
  constructor(
    public dialogRef: MatDialogRef<CourseTableLineomponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    console.log(data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
