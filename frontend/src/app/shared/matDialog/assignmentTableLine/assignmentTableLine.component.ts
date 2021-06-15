import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './assignmentTableLine.component.html',
})
export class AssignmentTableLineComponent {
  constructor(
    public dialogRef: MatDialogRef<AssignmentTableLineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    console.log(data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
