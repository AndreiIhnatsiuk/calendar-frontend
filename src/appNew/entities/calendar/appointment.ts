import {UserInfo} from './user-info';
import {AppointmentType} from './appointment-type';

export interface Appointment {
  id: number;
  user: UserInfo;
  mentor: UserInfo;
  appointmentType: AppointmentType;
  startDate: Date;
  endDate: Date;
  conferenceLink: string;
  description: string;
}
