import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
import {MatSidenav} from '@angular/material/sidenav';
import {AppointmentType} from '../../entities/calendar/appointment-type';


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
  appointmentTypes: number[];

  constructor(appointmentTypes: AppointmentType[]) {
    this.appointmentTypes = appointmentTypes.map(value => value.id);
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
    this.appointmentService.getAvailableTime().subscribe(time => {
      this.availableTime = time;
    });
    this.getAppointments();
    this.mentorService.get(1).subscribe(mentors => {
      this.mentors = mentors;
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

  getTimeForThisWeek() {
    this.displayedAvailableTime = 0;
    for (let i = 0; i < this.availableTime.length; i++) {
      if (isSameISOWeek(new Date(this.viewDate), new Date(this.availableTime[i].startDate))) {
        this.displayedAvailableTime = this.availableTime[i].minutes;
      }
    }
  }

  getAppointments() {
    this.appointmentEvent = [];
    this.appointmentService.getAppointments().subscribe({
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
        this.getTimeForThisWeek();
        this.isSelectOpen = !this.isSelectOpen;
      }
    });
  }

  filterEvents() {
    this.events = [];
    const filteredSlots: CalendarEvent[] = this.slotEvents.filter((element) => {
      return element.meta instanceof SlotMeta && element.meta.appointmentTypes.some(x => this.appointmentTypeIds.includes(x));
    });
    this.chosenMentorId ? this.events = this.appointmentEvent.concat(filteredSlots) : this.events = this.appointmentEvent;
    this.cdr.detectChanges();
  }

  getSlots(mentorId: number) {
    this.slotEvents = [];
    this.slotService.getSlots(mentorId).subscribe({
      next: value => {
        value.forEach(element => {
          const newEvent: CalendarEvent = {
            title: '',
            start: new Date(element.startDate),
            end: addMinutes(new Date(element.startDate), 15),
            color: {primary: 'rgb(51, 182, 121)', secondary: 'rgb(51, 182, 121)', secondaryText: 'white'},
            meta: new SlotMeta(element.appointmentTypes),
          };
          this.slotEvents.push(newEvent);
        });
      },
      complete: () => {
        this.isSelectOpen = !this.isSelectOpen;
        this.filterEvents();
      }
    });
  }

  useDialog(event: CalendarEvent) {
    this.dialogRef = this.dialog.open(EventDialogComponent, {data: event});
    this.dialogRef.afterClosed().subscribe({
      complete: () => {
        if (this.chosenMentorId === undefined) {
          this.getAppointments();
        } else {
          this.getAppointments();
          this.getSlots(this.chosenMentorId);
        }
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
        if (this.chosenMentorId === undefined) {
          this.getAppointments();
        } else {
          this.getAppointments();
          this.getSlots(this.chosenMentorId);
        }
      }
    });
  }
}
