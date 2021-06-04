import { Component } from '@angular/core';
import { SharedService } from '../shared/services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private sharedService: SharedService) {
    this.sharedService.enableBreadcrumb(false);
  }
}
