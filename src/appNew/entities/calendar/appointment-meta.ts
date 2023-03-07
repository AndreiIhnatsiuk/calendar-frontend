export class AppointmentMeta {
  eventTitle: string;
  eventDescription: string;
  eventConferenceLink: string;
  eventParticipants: string;
  mentorId: string;
  appointmentId: number;

  constructor(eventTitle: string,
              eventDescription: string,
              eventConferenceLink: string,
              eventParticipants: string,
              mentorId: string,
              appointmentId: number) {
    this.eventTitle = eventTitle;
    this.eventDescription = eventDescription;
    this.eventConferenceLink = eventConferenceLink;
    this.eventParticipants = eventParticipants;
    this.mentorId = mentorId;
    this.appointmentId = appointmentId;
  }
}
