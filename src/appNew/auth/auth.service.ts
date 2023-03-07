import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {Personal} from '../entities/personal';
import {OAuthErrorEvent, OAuthService} from 'angular-oauth2-oidc';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  private isDoneLoadingSubject = new BehaviorSubject<boolean>(false);
  public isDoneLoading = this.isDoneLoadingSubject.asObservable();

  public canActivateProtectedRoutes: Observable<boolean> = combineLatest([
    this.isAuthenticated,
    this.isDoneLoading
  ]).pipe(map(values => values.every(b => b)));

  constructor(
    private oauthService: OAuthService,
    private http: HttpClient,
    private router: Router,
  ) {
    this.oauthService.events.subscribe(event => {
      this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());
      if (['session_terminated', 'session_error'].includes(event.type)) {
        this.logout();
        location.reload();
      }
      if (event instanceof OAuthErrorEvent) {
        console.error('OAuthErrorEvent Object:', event);
      } else {
        console.warn('OAuthEvent Object:', event);
      }
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== 'access_token' && event.key !== null) {
        return;
      }
      const isAccessTokenValid = this.oauthService.hasValidAccessToken();
      console.warn('Noticed changes to access_token (most likely from another tab), updating isAuthenticated');
      this.isAuthenticatedSubject.next(isAccessTokenValid);
      if (!isAccessTokenValid) {
        this.logout();
        location.reload();
      }
    });

    this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());
    this.oauthService.setupAutomaticSilentRefresh();
  }

  public runInitialLoginSequence(): Promise<void> {
    return this.oauthService.loadDiscoveryDocumentAndLogin()
      .then(() => {
        this.isDoneLoadingSubject.next(true);
      })
      .catch(() => {
        this.isDoneLoadingSubject.next(true);
        this.oauthService.initCodeFlow();
      });
  }

  public logout() {
    this.oauthService.revokeTokenAndLogout();
  }

  public resetPassword(email: string): Observable<any> {
    return this.http.post('/api/reset-password-tokens', {email});
  }

  public updatePassword(token: string, password: string): Observable<any> {
    return this.http.patch('/api/reset-password-tokens/' + token, {password});
  }

  getMe(): Observable<Personal> {
    return this.http.get<Personal>('/api/users/me');
  }

  updatePersonal(phone: string, repository: string, emailNotifications: any): Observable<Personal> {
    const body: { [k: string]: any } = {emailNotifications: emailNotifications};
    if (phone) {
      body.phone = '+375' + phone;
    }
    if (repository) {
      body.repository = repository;
    }
    return this.http.patch<Personal>('/api/users/me', body);
  }

  create(name: string, email: string, password: string, offerNotification: boolean): Observable<any> {
    const headers = new HttpHeaders()
      .append('Authorization', 'Basic ' + btoa('web:web'));

    return this.http.post('/api/users', {name, email, level: 'Beginner', password, offerNotification}, {headers});
  }

  public requestMailConfirmation(): Observable<any> {
    return this.http.post('/api/confirmation-email-tokens', {});
  }

  public confirmEmail(token: string): Observable<any> {
    return this.http.patch('/api/confirmation-email-tokens/' + token, {});
  }
}
