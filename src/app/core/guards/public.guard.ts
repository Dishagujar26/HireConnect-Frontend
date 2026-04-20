import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { catchError, map, of } from 'rxjs';

export const publicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authStorage = inject(AuthStorageService);

  const token = authStorage.getAccessToken();

  if (!token) {
    return of(true);
  }

  return authService.validateToken().pipe(
    map((response) => {
      if (response.valid) {
        if (response.role === 'CANDIDATE') {
          return router.createUrlTree(['/candidate/dashboard']);
        }

        if (response.role === 'RECRUITER') {
          return router.createUrlTree(['/recruiter/dashboard']);
        }

        return router.createUrlTree(['/login']);
      }

      authStorage.clearSession();
      return true;
    }),
    catchError(() => {
      authStorage.clearSession();
      return of(true);
    })
  );
};