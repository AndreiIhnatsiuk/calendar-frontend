export class SlotRequest {
  from: Date;
  to: Date;
  appointmentTypes: number[];


  constructor(from: Date, to: Date, appointmentTypes: number[]) {
    this.from = from;
    this.to = to;
    this.appointmentTypes = appointmentTypes;
  }
}
