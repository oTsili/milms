import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private http: HttpClient) {}

  getEvents(
    startDate: string,
    endDate: string,
    eventsPerPage: number,
    currentPage: number,
    backend_url: string,
    sort: string = ''
  ) {
    const queryParams = `?pagesize=${eventsPerPage}&page=${currentPage}&sort=${sort}`;

    return this.http.post<{
      message: string;
      events: {
        time: string;
        event: string;
        email: string;
        firstName: string;
        lastName: string;
      }[];
      maxEvents: number;
    }>(
      `${backend_url}/events${queryParams}`,
      { startDate: startDate, endDate: endDate },
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
      }
    );
  }
}
