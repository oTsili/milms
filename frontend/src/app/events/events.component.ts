import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as events from 'events';
import { EventsService } from './events.service';

@Component({
  selector: 'app-events',
  templateUrl: 'events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit {
  displayedColumns: string[] = ['created', 'user', 'email', 'event'];
  isLoading = false;
  authEvents: {
    time: string;
    event: string;
    email: string;
    firstName: string;
    lastName: string;
  }[] = [];
  eventObjs: {
    time: string;
    event: string;
    email: string;
    firstName: string;
    lastName: string;
  }[];
  resultsLength = 30;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private eventService: EventsService) {}

  ngOnInit() {
    // this.eventService.getEvents().subscribe((data) => {
    //   data.map((event) => {
    //     email: event[0];
    //     firstName: event[1];
    //     lastName: event[2];
    //     time: event[3];
    //   });
    //   console.log(data);
    //   this.authEvents = data.events;
    // });
  }
  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }

  onSubmitEvents(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;

    this.eventService
      .getEvents(form.value.startDate, form.value.endDate)
      .subscribe((data) => {
        console.log(data);
        this.authEvents = data.events;
      });
  }
}
