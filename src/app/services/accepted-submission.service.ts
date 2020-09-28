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

  public getAccepted(taskIds: Array<number>, start?: Date, end?: Date): Observable<Set<number>> {
    if (taskIds.length) {
      let url = '/api/accepted-tasks?taskIds=' + taskIds.join(',');
      if (start) {
        url += '&start=' + start.toISOString();
      }
      if (end) {
        url += '&end=' + end.toISOString();
      }
      return concat(
        this.http.get<Array<number>>(url),
        this.submissionService.getChanges().pipe(
          filter(taskId => taskIds.indexOf(taskId) !== -1),
          switchMap(() => this.http.get<Array<number>>(url))
        )
      ).pipe(map(array => new Set(array)));
    } else {
      return EMPTY;
    }
  }

  public getAcceptedBySubtopics(): Observable<Map<number, number>> {
    const url = '/api/accepted-tasks?groupBy=subtopics';
    return concat(
      this.http.get<Map<number, number>>(url),
      this.submissionService.getChanges().pipe(
        switchMap(() => this.http.get<Map<number, number>>(url))
      )
    ).pipe(map(x => new Map<number, number>(Object.entries(x).map(y => [+y[0], y[1]]))));
  }
}
