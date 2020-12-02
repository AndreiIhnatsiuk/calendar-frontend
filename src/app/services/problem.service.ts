import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Problem} from '../entities/problem';
import {FullProblem} from '../entities/full-problem';

@Injectable({providedIn: 'root'})
export class ProblemService {
  constructor(private http: HttpClient) {
  }

  public getProblemsBySubtopicId(subtopicId: number): Observable<Array<Problem>> {
    return this.http.get<Array<Problem>>('/api/problems?subtopicId=' + subtopicId);
  }

  public countBySubtopic(): Observable<Map<number, number>> {
    return this.http.get('/api/problems?groupBy=subtopics')
      .pipe(map(x => new Map<number, number>(Object.entries(x).map(y => [+y[0], y[1]]))));
  }

  public getProblemById(id: number): Observable<FullProblem> {
    return this.http.get<FullProblem>('/api/problems/' + id);
  }
}
