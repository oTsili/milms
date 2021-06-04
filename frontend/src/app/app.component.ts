import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MatBreadcrumbService } from 'mat-breadcrumb';
import { SharedService } from './shared/services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'MILMS';
  breadcrumbEnabled = false;

  constructor(
    private authService: AuthService,
    private matBreadcrumbService: MatBreadcrumbService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.authService.autoAuthUser();
    const breadcrumb = {
      customText: 'This is Custom Text',
      dynamicText: 'Level 2 ',
    };

    this.sharedService.getBreadcrumbDisability().subscribe((condition) => {
      this.breadcrumbEnabled = condition;
    });
    this.matBreadcrumbService.updateBreadcrumbLabels(breadcrumb);
  }
}
