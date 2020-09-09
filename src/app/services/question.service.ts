import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Question} from '../entities/question';
import {FullQuestion} from '../entities/full-question';
import {UserAnswer} from '../entities/user-answer';

@Injectable({providedIn: 'root'})
export class QuestionService {
  constructor(private http: HttpClient) {
  }

  public getQuestionsByTopicId(topicId: number): Observable<Array<Question>> {
    return this.http.get<Array<Question>>('/api/questions?topicId=' + topicId);
  }

  public getQuestionById(id: number): Observable<FullQuestion> {
    return this.http.get<FullQuestion>('/api/questions/' + id);
  }

  public sendAnswerUser(id: number, answers: number[]): Observable<UserAnswer> {
    return this.http.post<UserAnswer>('/api/questions/' + id, {answer: answers});
  }

  public getAnswerUser(id: number): Observable<UserAnswer> {
    return this.http.get<UserAnswer>('/api/questions/answers?questionId=' + id);
  }
}
