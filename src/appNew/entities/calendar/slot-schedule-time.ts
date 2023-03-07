import {WeekTime} from './week-time';

export class SlotScheduleTime {
  start: WeekTime;
  end: WeekTime;
  appointmentTypes: number[];


  constructor(start: WeekTime, end: WeekTime, appointmentTypes: number[]) {
    this.start = start;
    this.end = end;
    this.appointmentTypes = appointmentTypes;
  }
}
