import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenInfo } from '../entities/token-info';
import { LocalStorageService } from './local-storage.service';

@Injectable({providedIn: 'root'})
export class AuthService {
  private currentUserSubject: BehaviorSubject<TokenInfo>;
  public currentUser: Observable<TokenInfo>;

  constructor(private http: HttpClient,
              private localStorageService: LocalStorageService) {
    this.currentUserSubject = new BehaviorSubject<TokenInfo>(JSON.parse(localStorageService.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): TokenInfo {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, callback: (data: any) => void, errorCallback: (error: any) => void) {
    const body = new HttpParams()
      .append('username', email)
      .append('password', password.trim())
      .append('grant_type', 'password');

    const headers = new HttpHeaders()
      .append('Authorization', 'Basic ' + btoa('web:web'));

    this.http.post('/oauth/token', body, {
      headers: headers
    }).subscribe(
      data => {
        const userData = <any>data;
        const token = <string>userData.access_token;
        if (token) {
          const user = new TokenInfo(token);
          this.localStorageService.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          callback(userData);
        }
      },
      error => {
        errorCallback(error);
      });
  }

  logout() {
    this.localStorageService.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}