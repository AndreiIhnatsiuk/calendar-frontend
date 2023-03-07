import {AuthConfig} from 'angular-oauth2-oidc';
import {environment} from '../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.auth.issuer,
  logoutUrl: environment.auth.logoutUrl,
  postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
  redirectUri: environment.auth.redirectUri,
  clientId: environment.auth.clientId,
  sessionChecksEnabled: environment.auth.sessionChecksEnabled,
  scope: environment.auth.scope,
  responseType: environment.auth.responseType,
  showDebugInformation: environment.auth.showDebugInformation,
  useSilentRefresh: environment.auth.useSilentRefresh,
  clearHashAfterLogin: environment.auth.clearHashAfterLogin,
  sessionCheckIntervall: environment.auth.sessionCheckIntervall
};
