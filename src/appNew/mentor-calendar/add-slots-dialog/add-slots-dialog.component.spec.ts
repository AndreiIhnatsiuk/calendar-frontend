import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSlotsDialogComponent } from './add-slots-dialog.component';

describe('AddSlotsDialogComponent', () => {
  let component: AddSlotsDialogComponent;
  let fixture: ComponentFixture<AddSlotsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSlotsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSlotsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
