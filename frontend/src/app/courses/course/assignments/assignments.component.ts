import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
})
export class AssignmentsComponent implements OnInit, OnDestroy {
  userRole: string;
  private userRoleSubscription: Subscription;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.getUserRole().subscribe((response) => {
      console.log('ngOnInit');
      this.userRole = response.userRole;
      console.log(this.userRole);
    });
    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        console.log(response);
        this.userRole = response;
      });
  }

  ngOnDestroy() {
    this.userRoleSubscription.unsubscribe();
  }
}
