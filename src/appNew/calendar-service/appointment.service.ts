import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Appointment} from '../entities/calendar/appointment';
import {AppointmentType} from '../entities/calendar/appointment-type';
import {AppointmentRequest} from '../entities/calendar/appointment-request';
import {AppointmentUpdate} from '../entities/calendar/appointment-update';
import {AppointmentTime} from '../entities/calendar/appointment-time';
import {DatePipe} from '@angular/common';

@Injectable({providedIn: 'root'})
export class AppointmentService {
  constructor(private http: HttpClient,
              private datePipe: DatePipe) {
  }

  public getAppointments(from?: Date, to?: Date): Observable<Array<Appointment>> {
    let params = new HttpParams();
    if (from) {
      params = params.append('from', this.formatDateToStringWithTemplate(from));
    }
    if (to) {
      params = params.append('to', this.formatDateToStringWithTemplate(to));
    }
    return this.http.get<Array<Appointment>>('/api/appointments?' + params.toString().replace('+', '%2B'));
  }

  public addAppointment(appointmentRequest: AppointmentRequest): Observable<any> {
    return this.http.post('/api/appointments', appointmentRequest);
  }

  public getAppointmentTypes(): Observable<Array<AppointmentType>> {
    return this.http.get<Array<AppointmentType>>('/api/appointment-types');
  }

  public deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete('/api/appointments/' + appointmentId);
  }

  public patchAppointment(appointmentId: number, update: AppointmentUpdate): Observable<AppointmentUpdate> {
    return this.http.patch<AppointmentUpdate>('/api/appointments/' + appointmentId, update);
  }

  public getAvailableTime(): Observable<Array<AppointmentTime>> {
    return this.http.get<Array<AppointmentTime>>('/api/appointments/time');
  }

  private formatDateToStringWithTemplate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZZZZZ');
  }
}
