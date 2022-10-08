import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, OnInit, ViewEncapsulation} from '@angular/core';
import {CalendarDateFormatter, CalendarEvent, CalendarEventTitleFormatter, DateFormatterParams} from 'angular-calendar';
import {DatePipe, formatDate} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {EventDialogComponent} from './event-dialog/event-dialog.component';
import {AddEventDialogComponent} from './add-event-dialog/add-event-dialog.component';
import {Mentor} from '../../entities/mentor';
import {AppointmentService} from '../../services/calendar-service/appointment.service';
import {SlotService} from '../../services/calendar-service/slot.service';
import {MentorService} from '../../services/mentor.service';
import {AppointmentMeta} from '../../entities/calendar/appointment-meta';
import {addMinutes, isSameISOWeek} from 'date-fns';
import {AppointmentTime} from '../../entities/calendar/appointment-time';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {
  public dayViewHour({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', locale);
  }

  public weekViewTitle({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'LLLL y', locale);
  }

  public weekViewColumnHeader({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'EEEEEE', locale);
  }

  public weekViewColumnSubHeader({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'd', locale);
  }
}

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CalendarEventTitleFormatter,
    },
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  viewDate = new Date();
  events: CalendarEvent[] = [];
  locale = 'ru';
  weekStartsOn: 1 = 1;
  dialogRef: any;
  mentors: Mentor[];
  chosenMentorId: number;
  availableTime: AppointmentTime[];
  displayedAvailableTime: number;

  constructor(private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private mentorService: MentorService,
              private datePipe: DatePipe,
              private slotService: SlotService,
              private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.appointmentService.getAvailableTime().subscribe(time => {
      this.availableTime = time;
    });
    this.getAppointments();
    this.mentorService.get(1).subscribe(mentors => {
      this.mentors = mentors;
    });
  }

  getTimeForThisWeek() {
    this.displayedAvailableTime = 0;
    for (let i = 0; i < this.availableTime.length; i++) {
      if (isSameISOWeek(new Date(this.viewDate), new Date(this.availableTime[i].startDate))) {
        this.displayedAvailableTime = this.availableTime[i].minutes;
      }
    }
  }

  getAppointments() {
    this.appointmentService.getAppointments().subscribe(data => {
      const newEvents: CalendarEvent[] = [];
      data.forEach(element => {
        const newEvent: CalendarEvent<AppointmentMeta> = {
          title: element.appointmentType.title + ' | ' + element.mentor.name + ' ' +
            this.datePipe.transform(element.startDate, 'HH:mm') + '-' + this.datePipe.transform(element.endDate, 'HH:mm'),
          start: new Date(element.startDate),
          end: new Date(element.endDate),
          color: {primary: 'rgb(63, 81, 181)', secondary: 'rgb(63, 81, 181)', secondaryText: 'white'},
          meta: {
            eventTitle: element.appointmentType.title,
            eventDescription: element.description,
            eventConferenceLink: element.conferenceLink,
            eventParticipants: element.mentor.name + ' | ' + element.user.name,
            mentorId: element.mentor.id,
            appointmentId: element.id
          } as AppointmentMeta,
        };
        newEvents.push(newEvent);
      });
      this.events = newEvents;
      this.getTimeForThisWeek();
      this.refresh();
    });
  }

  getSlots(mentorId: number) {
    this.getAppointments();
    this.slotService.get(mentorId).subscribe(slots => {
      const slotsEvent: CalendarEvent[] = [];
      slots.forEach(element => {
        const newEvent: CalendarEvent = {
          title: '',
          start: new Date(element.startDate),
          end: addMinutes(new Date(element.startDate), 15),
          color: {primary: '#51ab86', secondary: '#51ab86', secondaryText: 'white'},
        };
        slotsEvent.push(newEvent);
      });
      this.events = [...this.events].concat(slotsEvent);
      this.refresh();
    });
  }

  useDialog(event: CalendarEvent) {
    this.dialogRef = this.dialog.open(EventDialogComponent, {data: event});
    this.dialogRef.afterClosed().subscribe(() => {
      this.chosenMentorId === undefined ? this.getAppointments() : this.getSlots(this.chosenMentorId);
    });
  }

  eventClicked({event}: { event: CalendarEvent }): void {
    if (event.meta !== undefined) {
      this.useDialog(event);
    } else {
      this.addEvent(event);
    }
  }

  addEvent(event: CalendarEvent): void {
    this.dialogRef = this.dialog.open(AddEventDialogComponent, {data: {event: event, mentorId: this.chosenMentorId}});
    this.dialogRef.afterClosed().subscribe(() => {
      this.chosenMentorId === undefined ? this.getAppointments() : this.getSlots(this.chosenMentorId);
    });
  }

  private refresh() {
    this.events = [...this.events];
    this.cdr.detectChanges();
  }
}


