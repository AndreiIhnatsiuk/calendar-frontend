import {Component, Input, OnInit} from '@angular/core';
import {AppointmentService} from '../services/calendar-service/appointment.service';
import {AppointmentType} from '../entities/calendar/appointment-type';
import {Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-appointment-type-select',
  templateUrl: './appointment-type-select.component.html',
  styleUrls: ['./appointment-type-select.component.scss']
})
export class AppointmentTypeSelectComponent implements OnInit {
  @Output() sendAppointmentTypesIds = new EventEmitter();
  @Output('sortSlots') parentFun: EventEmitter<any> = new EventEmitter();
  appointmentTypeIds = [];
  appointmentTypes: AppointmentType[];
  @Input()
  allComplete = false;

  constructor(private appointmentsService: AppointmentService) {
  }

  ngOnInit(): void {
    this.appointmentsService.getAppointmentTypes().subscribe(types => {
      this.appointmentTypes = types;
      this.updateState(this.allComplete);
    });
  }

  sendEvent() {
    this.sendAppointmentTypesIds.emit(this.appointmentTypeIds);
  }

  addTypeId(id: number) {
    if (!this.appointmentTypeIds.includes(id)) {
      this.appointmentTypeIds.push(id);
    } else {
      this.appointmentTypeIds.splice(this.appointmentTypeIds.indexOf(id), 1);
    }
    this.sendEvent();
    this.parentFun.emit();
  }

  updateAllComplete() {
    this.allComplete = this.appointmentTypes.every(t => t.selected);
  }

  someComplete(): boolean {
    return this.appointmentTypes.filter(t => t.selected).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.appointmentTypeIds.length = 0;
    this.updateState(completed);
    this.sendEvent();
    this.parentFun.emit();
  }

  private updateState(completed: boolean) {
    this.allComplete = completed;
    this.appointmentTypes.forEach(t => (t.selected = completed));
    if (completed) {
      this.appointmentTypes.forEach(t => this.appointmentTypeIds.push(t.id));
    }
    this.sendEvent();
  }
}
