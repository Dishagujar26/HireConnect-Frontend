import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStorageService } from '../services/auth-storage.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStorage = inject(AuthStorageService);
  const http = inject(HttpClient);

  const accessToken = authStorage.getAccessToken();

  const isAuthApi =
    req.url.includes('/login') ||
    req.url.includes('/register') ||
    req.url.includes('/forgot-password') ||
    req.url.includes('/reset-password') ||
    req.url.includes('/refresh') ||
    req.url.includes('/oauth2/');

  let requestToSend = req;

  if (accessToken && !isAuthApi) {
    requestToSend = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(requestToSend).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthApi) {
        return throwError(() => error);
      }

      const refreshToken = authStorage.getRefreshToken();

      if (!refreshToken) {
        console.warn('401 error and no refresh token found. Clearing session.');
        authStorage.clearSession();
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        console.info('Token expired. Attempting refresh...');

        return http.post<any>(`${environment.authServiceBaseUrl}/refresh`, {
          refreshToken
        }).pipe(
          switchMap((response) => {
            console.info('Token refreshed successfully.');
            isRefreshing = false;
            authStorage.setAccessToken(response.accessToken);
            if (response.refreshToken) {
              authStorage.setRefreshToken(response.refreshToken);
            }
            refreshTokenSubject.next(response.accessToken);

            return next(req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`
              }
            }));
          }),
          catchError((refreshError) => {
            console.error('Refresh token failed. Clearing session.', refreshError);
            isRefreshing = false;
            authStorage.clearSession();
            return throwError(() => refreshError);
          })
        );
      } else {
        // If already refreshing, wait for the new token
        console.info('Already refreshing. Waiting for new token...');
        return refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            return next(req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            }));
          })
        );
      }
    })
  );
};