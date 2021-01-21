import {EMPTY, Observable} from 'rxjs';
import {filter, map, switchMap} from 'rxjs/operators';
import {concat} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {SubmissionService} from './submission.service';

@Injectable({providedIn: 'root'})
export class AcceptedSubmissionService {
  constructor(private http: HttpClient,
              private submissionService: SubmissionService) {
  }

  public getAccepted(problemIds: Array<number>, start?: Date, end?: Date): Observable<Map<number, boolean>> {
    if (problemIds.length) {
      let url = '/api/accepted-problems?problemIds=' + problemIds.join(',');
      if (start) {
        url += '&start=' + start.toISOString();
      }
      if (end) {
        url += '&end=' + end.toISOString();
      }
      return concat(
        this.http.get<Map<number, boolean>>(url),
        this.submissionService.getChanges().pipe(
          filter(problemId => problemIds.indexOf(problemId) !== -1),
          switchMap(() => this.http.get<Map<number, boolean>>(url))
        )
      ).pipe(map(x => new Map<number, boolean>(Object.entries(x).map(y => [+y[0], y[1]]))));
    } else {
      return EMPTY;
    }
  }

  public getAcceptedByLessons(): Observable<Map<number, number>> {
    const url = '/api/accepted-problems?groupBy=lessons';
    return concat(
      this.http.get<Map<number, number>>(url),
      this.submissionService.getChanges().pipe(
        switchMap(() => this.http.get<Object>(url))
      )
    ).pipe(map(x => new Map<number, number>(Object.entries(x).map(y => [+y[0], y[1]]))));
  }
}
