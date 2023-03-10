import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {Personal} from '../entities/personal';
import {FakeGtagService} from '../services/fake-gtag.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  personal: Personal;

  constructor(private authService: AuthService,
              private gtag: FakeGtagService) {
  }

  ngOnInit() {
    this.authService.getMe().subscribe(personal => {
      this.personal = personal;
      this.gtag.setUserId(personal.analyticsId);
      this.gtag.event('set', {
        event_category: 'userId'
      });
    });
  }

  logout() {
    this.authService.logout();
  }
}
