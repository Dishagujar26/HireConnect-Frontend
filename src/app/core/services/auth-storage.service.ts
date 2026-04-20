import { Injectable } from '@angular/core';

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {

  saveSession(data: SessionData): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('userId', data.userId.toString());
  }

  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}