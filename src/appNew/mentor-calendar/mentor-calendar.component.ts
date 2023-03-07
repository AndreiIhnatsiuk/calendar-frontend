import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, OnInit, ViewEncapsulation} from '@angular/core';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter,
  DateFormatterParams
} from 'angular-calendar';
import {WeekViewHourSegment} from 'calendar-utils';
import {fromEvent, Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {addDays, addMinutes, endOfISOWeek, endOfWeek, isSameISOWeek, setDay, startOfISOWeek} from 'date-fns';
import {DatePipe, formatDate} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {AppointmentService} from '../calendar-service/appointment.service';
import {SlotService} from '../calendar-service/slot.service';
import {AppointmentMeta} from '../entities/calendar/appointment-meta';
import {MentorEventDialogComponent} from './event-dialog/event-dialog.component';
import {MentorAddEventDialogComponent} from './add-event-dialog/add-event-dialog.component';
import {AddSlotsDialogComponent} from './add-slots-dialog/add-slots-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../app/auth/auth.service';
import {FormControl, FormGroup} from '@angular/forms';
import {SlotScheduleRequest} from '../entities/calendar/slot-schedule-request';
import {SlotScheduleTime} from '../entities/calendar/slot-schedule-time';
import {DateAdapter, NativeDateAdapter} from '@angular/material/core';

function floorToNearest(amount: number, precision: number) {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number) {
  return Math.ceil(amount / precision) * precision;
}

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

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  getFirstDayOfWeek(): number {
    return 1;
  }
}

class SlotMeta {
  constructor() {
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
    },
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './mentor-calendar.component.html',
  styleUrls: ['./mentor-calendar.component.scss']
})
export class MentorCalendarComponent implements OnInit {
  viewDate = new Date();
  scheduleEvents: CalendarEvent[] = [];
  events: CalendarEvent[] = [];
  locale = 'ru';
  dragToCreateActive = false;
  weekStartsOn: 1 = 1;
  dialogRef: any;
  mentorId: string;
  isPlanningMode = false;
  isReschedulingMode = false;
  slotScheduleRequest: SlotScheduleRequest[] = [];
  chosenSlotScheduleRequest: SlotScheduleRequest;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  slotScheduleTimes: SlotScheduleTime[] = [];
  refreshTime = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private slotService: SlotService,
              private datePipe: DatePipe,
              private authService: AuthService,
              private appointmentService: AppointmentService) {
  }

  ngOnInit() {
    this.getAppointments();
    this.authService.getMe().subscribe((me) => {
      this.mentorId = me.id;
      this.getSlots(me.id);
    });
    this.getSchedules();
  }

  getSchedules() {
    this.slotService.getSchedule().subscribe((slotSchedules) => {
      this.slotScheduleRequest = slotSchedules;
    });
  }

  getAppointments() {
    this.appointmentService.getAppointments(isSameISOWeek(this.viewDate, new Date) ? new Date : startOfISOWeek(this.viewDate),
      endOfISOWeek(this.viewDate)).subscribe(data => {
      const newEvents: CalendarEvent[] = [];
      data.forEach(element => {
        const newEvent: CalendarEvent = {
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
        newEvents.push(newEvent);
      });
      this.events = newEvents;
      this.refresh();
    });
  }

  getSlots(mentorId: string) {
    this.getAppointments();
    this.slotService.getSlots(mentorId, isSameISOWeek(this.viewDate, new Date) ? new Date : startOfISOWeek(this.viewDate),
      endOfISOWeek(this.viewDate)).subscribe(slots => {
      const slotsEvent: CalendarEvent[] = [];
      slots.forEach(element => {
        const newEvent: CalendarEvent = {
          title: '',
          start: new Date(element.startDate),
          end: addMinutes(new Date(element.startDate), 15),
          color: {primary: 'rgb(51, 182, 121)', secondary: 'rgb(51, 182, 121)', secondaryText: 'white'},
          meta: new SlotMeta(),
        };
        slotsEvent.push(newEvent);
      });
      this.events = [...this.events].concat(slotsEvent);
      this.refresh();
      console.log(this.events);
    });
  }

  useDialog(event: CalendarEvent) {
    this.dialogRef = this.dialog.open(MentorEventDialogComponent, {data: event});
    this.dialogRef.afterClosed().subscribe(() => {
      this.getSlots(this.mentorId);
      this.refresh();
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
    this.dialogRef = this.dialog.open(MentorAddEventDialogComponent, {data: {event: event, mentorId: this.mentorId}});
    this.dialogRef.afterClosed().subscribe({
      complete: () => {
        this.getSlots(this.mentorId);
        this.refresh();
      }
    });
  }


  startDragToCreate(segment: WeekViewHourSegment, mouseDownEvent: MouseEvent, segmentElement: HTMLElement) {
    const color1 = {primary: '#ead137', secondary: '#ead137', secondaryText: 'white'};
    const color2 = {primary: 'rgb(131,199,231)', secondary: 'rgb(131,199,231)', secondaryText: 'white'};
    const dragToSelectEvent: CalendarEvent = {
      id: this.events.length,
      title: this.isPlanningMode ? '' : 'New slots',
      color: this.isPlanningMode ? color1 : color2,
      start: segment.date,
      actions: this.isPlanningMode ? [
        {
          label: '<i class="material-icons mat-icon"><span class="event-action">delete_outlined</span></i>',
          onClick: ({event}: { event: CalendarEvent }): void => {
            this.events = this.events.filter((iEvent) => iEvent !== event);
            console.log('Event deleted', event);
            console.log(this.scheduleEvents);
          },
        },
      ] : null,
      resizable: {
        beforeStart: this.isPlanningMode,
        afterEnd: this.isPlanningMode,
      },
      meta: {
        tmpEvent: true,
      },
    };
    this.events = [...this.events, dragToSelectEvent];
    const segmentPosition = segmentElement.getBoundingClientRect();
    this.dragToCreateActive = true;
    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent(document, 'mousemove')
      .pipe(
        finalize(() => {
          delete dragToSelectEvent.meta.tmpEvent;
          this.dragToCreateActive = false;
          this.refresh();
        }),
        takeUntil(fromEvent(document, 'mouseup'))
      )
      .subscribe({
        next: (mouseMoveEvent: MouseEvent) => {
          const minutesDiff = ceilToNearest(
            mouseMoveEvent.clientY - segmentPosition.top,
            15
          );
          const daysDiff =
            floorToNearest(
              mouseMoveEvent.clientX - segmentPosition.left,
              segmentPosition.width
            ) / segmentPosition.width;

          const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);
          if (newEnd > segment.date && newEnd < endOfView) {
            dragToSelectEvent.end = newEnd;
          }
          this.refresh();
        },
        complete: () => {
          if (dragToSelectEvent.end === undefined) {
            dragToSelectEvent.end = addMinutes(dragToSelectEvent.start, 15); // hardcode slot duration
          }
          this.dialogRef = this.dialog
            .open(AddSlotsDialogComponent,
              {
                data:
                  {
                    start: dragToSelectEvent.start,
                    end: dragToSelectEvent.end,
                    isPlanningMode: this.isPlanningMode,
                    scheduleEvents: this.scheduleEvents,
                    currentEvent: dragToSelectEvent
                  }
              });
          this.dialogRef.afterClosed().subscribe(() => {
            if (!this.isPlanningMode) {
              this.getAppointments();
              this.getSlots(this.mentorId);
            }
            if (Object.keys(dragToSelectEvent.meta).length === 0) {
              this.events = this.events.filter((iEvent) => iEvent !== dragToSelectEvent);
            }
            this.refresh();
          });
        },
      });
  }

  switchPlanningMode() {
    this.isPlanningMode = !this.isPlanningMode;
    this.scheduleEvents = [];
    this.getAppointments();
    this.getSlots(this.mentorId);
    this.refreshDatePickerPeriodValue();
  }

  switchReschedulingMode() {
    this.isReschedulingMode = !this.isReschedulingMode;
    this.getAppointments();
    this.getSlots(this.mentorId);
    this.refreshDatePickerPeriodValue();
  }

  createSchedule() {
    if (this.isPlanningMode) {
      this.scheduleEvents.forEach((event) => {
        const startDay = this.datePipe.transform(event.start, 'EEEE').toUpperCase();
        const startTime = this.datePipe.transform(event.start, 'HH:mm:ss.SSSZZZZZ');
        const endDay = this.datePipe.transform(event.start, 'EEEE').toUpperCase();
        const endTime = this.datePipe.transform(event.end, 'HH:mm:ss.SSSZZZZZ');
        const slotScheduleTime = new SlotScheduleTime(
          {dayOfWeek: startDay, time: startTime},
          {dayOfWeek: endDay, time: endTime},
          event.meta.appointmentTypes);
        this.slotScheduleTimes.push(slotScheduleTime);
      });
    } else {
      this.slotScheduleTimes = this.chosenSlotScheduleRequest.slotScheduleTimes;
    }
    const slotScheduleRequest = new SlotScheduleRequest(new Date(this.range.value.start),
      new Date(this.range.value.end), this.slotScheduleTimes);
    this.slotService.createSchedule(slotScheduleRequest).subscribe({
      next: () => {
        this.snackBar.open('Расписание создано', undefined, {
          duration: 10000
        });
      },
      error: (err) => {
        this.snackBar.open(err.error.message, undefined, {
          duration: 10000
        });
      },
      complete: () => {
        this.isPlanningMode = false;
        this.scheduleEvents = [];
        this.getAppointments();
        this.getSlots(this.mentorId);
        this.getSchedules();
        this.refreshDatePickerPeriodValue();
        this.refresh();
      }
    });
  }

  displayScheduleInReschedulingMode(slotScheduleRequest: SlotScheduleRequest) {
    this.events = [...this.events].filter(value => !this.scheduleEvents.includes(value));
    this.range.setValue({start: this.chosenSlotScheduleRequest.startDate, end: this.chosenSlotScheduleRequest.endDate});
    this.scheduleEvents = [];
    const newEvents: CalendarEvent[] = [];
    slotScheduleRequest.slotScheduleTimes.forEach(element => {
      const newEvent: CalendarEvent = {
        title: '',
        start: this.setTime(element.start.time, this.getDateOfWeekDayForCurrentWeek(element.start.dayOfWeek)),
        end: this.setTime(element.end.time, this.getDateOfWeekDayForCurrentWeek(element.end.dayOfWeek)),
        color: {primary: '#ead137', secondary: '#ead137', secondaryText: 'white'},
      };
      newEvents.push(newEvent);
    });
    this.scheduleEvents = newEvents;
    this.events = [...this.events].concat(this.scheduleEvents);
    this.refresh();
  }

  changeScheduleEndTime(scheduleId: number) {
    this.slotService.patchSchedule(scheduleId, {endDate: new Date(this.range.value.end)}).subscribe({
      next: () => {
        this.snackBar.open('Дата окончания расписания изменена', undefined, {
          duration: 10000
        });
      },
      error: (err) => {
        this.snackBar.open(err.error.message, undefined, {
          duration: 10000
        });
      },
    });
  }

  private setTime(source: string, dateSource: Date): Date {
    const time: string = source || '00:00:00';
    const date = new Date(`01-01-00 ${time}`);
    dateSource.setHours(date.getHours(), date.getMinutes(), 0);
    return dateSource;
  }

  private getDateOfWeekDayForCurrentWeek(weekDay: string): Date {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return setDay(new Date(), days.indexOf(weekDay), {weekStartsOn: 1});
  }

  private refreshDatePickerPeriodValue() {
    this.range.setValue({start: null, end: null});
  }

  private refresh() {
    this.events = [...this.events];
    this.cdr.detectChanges();
  }

  eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refreshTime.next();
  }

  getEventsWhenWeekChange() {
    this.getSlots(this.mentorId);
  }
}


