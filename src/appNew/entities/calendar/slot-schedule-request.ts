import {SlotScheduleTime} from './slot-schedule-time';

export class SlotScheduleRequest {
  id: number;
  startDate: Date;
  endDate: Date;
  slotScheduleTimes: SlotScheduleTime[];

  constructor(startDate: Date, endDate: Date, slotScheduleTimes: SlotScheduleTime[]) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.slotScheduleTimes = slotScheduleTimes;
  }
}
