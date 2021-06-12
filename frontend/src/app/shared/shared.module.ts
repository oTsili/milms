import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { BrowserModule } from '@angular/platform-browser';

import { DragAndDropModule } from './dragAndDrop/dragAndDrop.module';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ErrorComponent } from './matDialog/error/error.component';
import { NotificationComponent } from './matDialog/notification/notification.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

@NgModule({
  declarations: [ErrorComponent, NotificationComponent, PdfViewerComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    CommonModule,
    RouterModule,
    DragAndDropModule,
    NgxDocViewerModule,
    NgxExtendedPdfViewerModule,
    BrowserModule,
  ],
})
export class SharedModule {}
