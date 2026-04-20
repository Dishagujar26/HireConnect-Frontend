import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStorageService } from '../services/auth-storage.service';

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

  const requestToSend =
    accessToken && !isAuthApi
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      : req;

  return next(requestToSend).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthApi) {
        return throwError(() => error);
      }

      const refreshToken = authStorage.getRefreshToken();

      if (!refreshToken) {
        authStorage.clearSession();
        return throwError(() => error);
      }

      return http.post<any>(`${environment.authServiceBaseUrl}/refresh`, {
        refreshToken
      }).pipe(
        switchMap((response) => {
          authStorage.setAccessToken(response.accessToken);

          if (response.refreshToken) {
            authStorage.setRefreshToken(response.refreshToken);
          }

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });

          return next(retryReq);
        }),
        catchError((refreshError) => {
          authStorage.clearSession();
          return throwError(() => refreshError);
        })
      );
    })
  );
};