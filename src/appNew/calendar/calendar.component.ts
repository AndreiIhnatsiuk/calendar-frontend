import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CalendarDateFormatter, CalendarEvent, CalendarEventTitleFormatter, DateFormatterParams} from 'angular-calendar';
import {DatePipe, formatDate} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {EventDialogComponent} from './event-dialog/event-dialog.component';
import {AddEventDialogComponent} from './add-event-dialog/add-event-dialog.component';
import {Mentor} from '../../app/entities/mentor';
import {AppointmentService} from '../calendar-service/appointment.service';
import {SlotService} from '../calendar-service/slot.service';
import {MentorService} from '../../app/services/mentor.service';
import {AppointmentMeta} from '../entities/calendar/appointment-meta';
import {addMinutes, endOfISOWeek, isSameISOWeek, startOfISOWeek} from 'date-fns';
import {AppointmentTime} from '../entities/calendar/appointment-time';
import {MatSidenav} from '@angular/material/sidenav';


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

class SlotMeta {
  appointmentType: number;
  title: string;

  constructor(appointmentType: number, title: string) {
    this.appointmentType = appointmentType;
    this.title = title;
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
  chosenMentorId: string;
  availableTime: AppointmentTime[];
  displayedAvailableTime: number;
  appointmentTypeIds = [];
  @ViewChild('sidenav') sidenav: MatSidenav;
  isExpanded = false;
  showSubmenu = true;
  isShowing = false;
  isSelectOpen = false;
  slotEvents: CalendarEvent[] = [];
  appointmentEvent: CalendarEvent[] = [];

  constructor(private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private mentorService: MentorService,
              private datePipe: DatePipe,
              private slotService: SlotService,
              private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.getAvailableTimeForCurrentWeek();
    this.getAppointments();
    this.mentorService.get(1).subscribe(mentors => { // Course hardcode
      this.mentors = mentors;
    });
    console.log(this.chosenMentorId);
  }

  getAvailableTimeForCurrentWeek() {
    this.appointmentService.getAvailableTime().subscribe({
      next: time => {
        this.availableTime = time;
      },
      complete: () => {
        this.displayedAvailableTime = 0;
        for (const item of this.availableTime) {
          if (isSameISOWeek(new Date(this.viewDate), new Date(item.startDate))) {
            this.displayedAvailableTime = item.minutes;
          }
        }
      }
    });
  }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded && this.isSelectOpen) {
      this.isShowing = false;
    }
  }

  getAppointments() {
    this.appointmentEvent = [];
    this.appointmentService.getAppointments(isSameISOWeek(this.viewDate, new Date) ? new Date : startOfISOWeek(this.viewDate),
      endOfISOWeek(this.viewDate)).subscribe({
      next: value => {
        value.forEach(element => {
          const newAppointmentEvent: CalendarEvent<AppointmentMeta> = {
            title: element.appointmentType.title + ' | ' + element.mentor.name + ' ' +
              this.datePipe.transform(element.startDate, 'HH:mm') + '-' + this.datePipe.transform(element.endDate, 'HH:mm'),
            start: new Date(element.startDate),
            end: new Date(element.endDate),
            color: {primary: 'rgb(63, 81, 181)', secondary: 'rgb(63, 81, 181)', secondaryText: 'white'},
            meta: new AppointmentMeta(
              element.appointmentType.title,
              element.description,
              element.conferenceLink,
              element.mentor.name + ' | ' + element.user.name,
              element.mentor.id,
              element.id
            ),
          };
          this.appointmentEvent.push(newAppointmentEvent);
        });
      },
      complete: () => {
        this.filterEvents();
        this.getAvailableTimeForCurrentWeek();
        this.isSelectOpen = !this.isSelectOpen;
        console.log(this.chosenMentorId);
      }
    });
  }

  filterEvents() {
    this.events = [];
    const filteredSlots: CalendarEvent[] = this.slotEvents.filter((element) => {
      return element.meta instanceof SlotMeta && this.appointmentTypeIds.includes(element.meta.appointmentType);
    });
    this.chosenMentorId ? this.events = this.appointmentEvent.concat(filteredSlots) : this.events = this.appointmentEvent;
    this.cdr.detectChanges();
    console.log(this.events);
  }

  getSlots(mentorId: string) {
    this.slotEvents = [];
    this.slotService.getSlots(mentorId, isSameISOWeek(this.viewDate, new Date) ? new Date : startOfISOWeek(this.viewDate),
      endOfISOWeek(this.viewDate)).subscribe({
      next: value => {
        value.forEach(element => {
          element.appointmentTypes.sort((a, b) => a.id - b.id).forEach((type) => {
            const newEvent: CalendarEvent = {
              title: '',
              start: new Date(element.startDate),
              end: addMinutes(new Date(element.startDate), 15),
              color: {primary: '#' + type.color, secondary: '#' + type.color, secondaryText: 'white'},
              meta: new SlotMeta(type.id, type.title),
            };
            this.slotEvents.push(newEvent);
          });
        });
      },
      complete: () => {
        this.isSelectOpen = !this.isSelectOpen;
        this.filterEvents();
        console.log(this.chosenMentorId);
      }
    });
  }

  useDialog(event: CalendarEvent) {
    this.dialogRef = this.dialog.open(EventDialogComponent, {data: event});
    this.dialogRef.afterClosed().subscribe({
      complete: () => {
        this.getEventsForWeekChange(this.chosenMentorId);
      }
    });
  }

  eventClicked({event}: { event: CalendarEvent }): void {
    if (event.meta instanceof AppointmentMeta) {
      this.useDialog(event);
    } else if (event.meta instanceof SlotMeta) {
      this.addEvent(event);
    }
  }

  addEvent(event: CalendarEvent): void {
    this.dialogRef = this.dialog.open(AddEventDialogComponent, {data: {event: event, mentorId: this.chosenMentorId}});
    this.dialogRef.afterClosed().subscribe({
      complete: () => {
        this.getEventsForWeekChange(this.chosenMentorId);
      }
    });
  }

  getEventsForWeekChange(mentorId: string) {
    if (mentorId) {
      this.getSlots(mentorId);
    }
    this.getAppointments();
    console.log(this.availableTime);
  }
}
