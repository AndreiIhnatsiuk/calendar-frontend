import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentTypeSelectComponent } from './appointment-type-select.component';

describe('AppointmentTypeSelectComponent', () => {
  let component: AppointmentTypeSelectComponent;
  let fixture: ComponentFixture<AppointmentTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentTypeSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
