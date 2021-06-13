import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'newTableLine.component.html',
})
export class NewTableLineComponent {
  constructor(
    public dialogRef: MatDialogRef<NewTableLineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    console.log(data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
