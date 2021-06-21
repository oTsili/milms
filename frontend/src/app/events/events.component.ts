import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedService } from '../shared/services/shared.service';
@Component({
  selector: 'app-events',
  templateUrl: 'events.component.html',
})
export class EventsComponent implements OnInit, OnDestroy {
  userRole: string;
  userRoleSubscription: Subscription;

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.getUserRole().subscribe((response) => {
      this.userRole = response.userRole;
    });

    this.userRoleSubscription = this.sharedService
      .getUserRoleListener()
      .subscribe((response) => {
        this.userRole = response;
      });
  }

  ngOnDestroy() {
    this.userRoleSubscription.unsubscribe();
  }
}
