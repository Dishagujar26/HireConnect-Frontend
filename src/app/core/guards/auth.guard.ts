import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const authStorage = inject(AuthStorageService);

  const token = authStorage.getAccessToken();

  if (!token) {
    router.navigate(['/login']);
    return of(false);
  }

  return authService.validateToken().pipe(
    map((response) => {
      if (response.valid) {
        return true;
      } else {
        authStorage.clearSession();
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      authStorage.clearSession();
      router.navigate(['/login']);
      return of(false);
    })
  );
};