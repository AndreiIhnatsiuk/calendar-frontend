import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CalendarEvent} from 'angular-calendar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppointmentType} from '../../../entities/calendar/appointment-type';
import {AppointmentService} from '../../../services/calendar-service/appointment.service';
import {AppointmentRequest} from '../../../entities/calendar/appointment-request';
import {AppointmentUpdate} from '../../../entities/calendar/appointment-update';

class DialogData {
  event: CalendarEvent;
  mentorId: number;
  dialog: any;
}

@Component({
  selector: 'app-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss']
})
export class AddEventDialogComponent implements OnInit { // TODO refactor conditions at HTML
  description: string;
  sending = false;

  constructor(private appointmentsService: AppointmentService,
              private snackBar: MatSnackBar,
              private dialogRef: MatDialogRef<AddEventDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit(): void {
  }

  addEvent(): void {
    this.sending = true;
    const appointmentRequest =
      new AppointmentRequest(this.data.mentorId, this.data.event.meta.appointmentType, this.description, this.data.event.start);
    this.appointmentsService.addAppointment(appointmentRequest).subscribe(() => {
      this.sending = false;
      this.snackBar.open('Отправлено', undefined, {
        duration: 10000
      });
    }, (err) => {
      this.sending = false;
      this.snackBar.open(err.error.message, undefined, {
        duration: 10000
      });
    });
    this.dialogRef.close();
  }

  patchEvent(): void {
    this.sending = true;
    const update = new AppointmentUpdate(this.description);
    this.appointmentsService.patchAppointment(this.data.event.meta.appointmentId, update).subscribe(() => {
      this.sending = false;
      this.snackBar.open('Изменено', undefined, {
        duration: 10000
      });
    }, (err) => {
      this.sending = false;
      this.snackBar.open(err.error.message, undefined, {
        duration: 10000
      });
    });
    this.dialogRef.close();
    this.data.dialog.close();
  }
}
