import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const ASSIGNMENTS_BACKEND_URL =
  environment.ASSIGNMENT_BASE_URL + '/api/assignments';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private http: HttpClient) {}

  getEvents(startDate: string, endDate: string) {
    return this.http.post<{
      message: string;
      events: {
        time: string;
        event: string;
        email: string;
        firstName: string;
        lastName: string;
      }[];
    }>(
      ASSIGNMENTS_BACKEND_URL + '/events',
      { startDate: startDate, endDate: endDate },
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
      }
    );
  }
}
