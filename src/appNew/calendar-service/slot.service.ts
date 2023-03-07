import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Slot} from '../entities/calendar/slot';
import {SlotRequest} from '../entities/calendar/slot-request';
import {SlotScheduleRequest} from '../entities/calendar/slot-schedule-request';
import {SlotScheduleUpdate} from '../entities/calendar/slot-schedule-update';
import {DatePipe} from '@angular/common';

@Injectable({providedIn: 'root'})
export class SlotService {
  constructor(private http: HttpClient,
              private datePipe: DatePipe) {
  }

  public getSlots(mentorId: string, from?: Date, to?: Date): Observable<Array<Slot>> {
    let params = new HttpParams();
    params = params.append('mentorId', mentorId);
    if (from) {
      params = params.append('from', this.formatDateToStringWithTemplate(from));
    }
    if (to) {
      params = params.append('to', this.formatDateToStringWithTemplate(to));
    }
    return this.http.get<Array<Slot>>('/api/slots?' + params.toString().replace('+', '%2B'));
  }

  public createSlots(slotDto: SlotRequest): Observable<any> {
    return this.http.post('/api/slots', slotDto);
  }

  public deleteSlots(from: Date, to: Date): Observable<any> {
    const params = new HttpParams()
      .set('from', this.formatDateToStringWithTemplate(from))
      .set('to', this.formatDateToStringWithTemplate(to));
    return this.http.delete('/api/slots?' + params.toString().replace('+', '%2B'));
  }

  public createSchedule(slotScheduleRequest: SlotScheduleRequest): Observable<SlotScheduleRequest> {
    return this.http.post<SlotScheduleRequest>('/api/slot-schedule', slotScheduleRequest);
  }

  public getSchedule(): Observable<Array<SlotScheduleRequest>> {
    const params = new HttpParams()
      .set('timezone', this.datePipe.transform(new Date(), 'ZZZZZ'));
    return this.http.get<Array<SlotScheduleRequest>>('/api/slot-schedule?', {params: params});
  }

  public patchSchedule(scheduleId: number, slotScheduleUpdate: SlotScheduleUpdate): Observable<any> {
    return this.http.patch('/api/slot-schedule/' + scheduleId, slotScheduleUpdate);
  }

  private formatDateToStringWithTemplate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZZZZZ');
  }
}
