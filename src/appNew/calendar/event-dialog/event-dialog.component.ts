import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CalendarEvent} from 'angular-calendar';
import {AddEventDialogComponent} from '../add-event-dialog/add-event-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppointmentService} from '../../calendar-service/appointment.service';

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent {
  dialogPatch: any;
  sending = false;

  constructor(private dialogRef: MatDialogRef<EventDialogComponent>,
              private dialog: MatDialog,
              private appointmentService: AppointmentService,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public event: CalendarEvent) {
  }

  confirm(id: number): void {
    this.sending = true;
    if (confirm('Действительно хотите удалить?')) {
      this.delete(id);
    }
    this.sending = false;
  }

  delete(id: number): void {
    this.sending = true;
    this.appointmentService.deleteAppointment(id).subscribe(() => {
      this.sending = false;
      this.snackBar.open('Удалено', undefined, {
        duration: 10000
      });
    }, (err) => {
      this.sending = false;
      this.snackBar.open(err.error.message, undefined, {
        duration: 5000
      });
    });
    this.dialogRef.close();
  }

  usePatchDialog() {
    this.dialogPatch = this.dialog.open(AddEventDialogComponent, {data: {event: this.event, mentorId: null, dialog: this.dialogRef}});
  }
}
