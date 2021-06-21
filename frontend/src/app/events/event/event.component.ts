import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import * as events from 'events';
import { environment } from 'src/environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { EventService } from './event.service';

@Component({
  selector: 'app-event',
  templateUrl: 'event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() BACKEND_URL: string;
  displayedColumns: string[] = ['time', 'user', 'email', 'event'];
  isLoading = false;
  events: {
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
  form: NgForm;
  pageSizeOptions = environment.PAGE_SIZE_OPTIONS;
  totalEvents = environment.TOTAL_COURSES;
  eventsPerPage = environment.COURSES_PER_PAGE;
  currentPage = environment.CURRENT_PAGE;
  constructor(
    private eventService: EventService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    // enable the page breadcrumb
    this.sharedService.enableBreadcrumb(true);
    // this.eventService.getEvents().subscribe((data) => {
    //   data.map((event) => {
    //     email: event[0];
    //     firstName: event[1];
    //     lastName: event[2];
    //     time: event[3];
    //   });
    //   console.log(data);
    //   this.events = data.events;
    // });
  }

  onSubmitEvents(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.form = form;
    this.isLoading = true;

    this.eventService
      .getEvents(
        form.value.startDate,
        form.value.endDate,
        this.eventsPerPage,
        this.currentPage,
        this.BACKEND_URL
      )
      .subscribe((data) => {
        this.events = data.events;
        this.totalEvents = data.maxEvents;
        this.isLoading = false;
      });
  }

  // fetches the assignments of the corresponding page of the pagination
  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.eventsPerPage = pageData.pageSize;
    this.isLoading = true;
    this.eventService
      .getEvents(
        this.form.value.startDate,
        this.form.value.endDate,
        this.eventsPerPage,
        this.currentPage,
        this.BACKEND_URL
      )
      .subscribe((response) => {
        this.events = response.events;
        this.totalEvents = response.maxEvents;

        // this.dataSource = new MatTableDataSource(response.materials);
        this.isLoading = false;
      });
  }

  // fetches the assignments sorted with regard the 'sort.active' value
  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.events = this.events.slice();
      return;
    }

    this.isLoading = true;
    this.eventService
      .getEvents(
        this.form.value.startDate,
        this.form.value.endDate,
        this.eventsPerPage,
        this.currentPage,
        this.BACKEND_URL,
        JSON.stringify(sort)
      )
      .subscribe((response) => {
        this.events = response.events;
        this.totalEvents = response.maxEvents;

        // this.dataSource = new MatTableDataSource(response.materials);
        this.isLoading = false;
      });
  }
}
