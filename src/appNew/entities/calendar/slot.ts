import {AppointmentType} from './appointment-type';

export interface Slot {
  startDate: Date;
  appointmentTypes: AppointmentType[];
}
