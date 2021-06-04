import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { DndDirective } from './dragAndDrop.directive';
import { DragAndDropComponent } from './dragAndDrop.component';
import { ProgressComponent } from './progress-bar/progress-bar.component';
import { AngularMaterialModule } from '../../angular-material.module';

@NgModule({
  imports: [BrowserModule, FormsModule, AngularMaterialModule],
  declarations: [DragAndDropComponent, DndDirective, ProgressComponent],
  exports: [DragAndDropComponent, DndDirective, ProgressComponent],
})
export class DragAndDropModule {}
