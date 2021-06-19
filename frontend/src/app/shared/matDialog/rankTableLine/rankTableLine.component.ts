import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DialogData } from 'src/app/models/dialog-data';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'rank-dialog',
  templateUrl: './rankTableLine.component.html',
})
export class RankTableLineomponent {
  constructor(
    public sharedService: SharedService,
    public dialogRef: MatDialogRef<RankTableLineomponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.sharedService.onNoButtonClick();
    this.dialogRef.close();
  }
}
