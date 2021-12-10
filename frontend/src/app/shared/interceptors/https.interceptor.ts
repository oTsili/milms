import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class httpsInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const secureReq = req.clone({
      // url: req.url.replace('http://', 'https://'),
      url: req.url
        .replace('http://localhost:3000', 'https://milms.tech')
        .replace('http://localhost:4000', 'https://milms.tech'), // for local development
    });

    return next.handle(secureReq);
  }
}
