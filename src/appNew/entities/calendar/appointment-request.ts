export class AppointmentRequest {
  mentorId: string;
  appointmentTypeId: number;
  description: string;
  startDate: Date;

  constructor(mentorId: string, appointmentTypeId: number, description: string, startDate: Date) {
    this.mentorId = mentorId;
    this.appointmentTypeId = appointmentTypeId;
    this.description = description;
    this.startDate = startDate;
  }
}
