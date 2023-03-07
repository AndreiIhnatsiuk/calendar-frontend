import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentorCalendarComponent } from './mentor-calendar.component';

describe('CalendarComponent', () => {
  let component: MentorCalendarComponent;
  let fixture: ComponentFixture<MentorCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MentorCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentorCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
