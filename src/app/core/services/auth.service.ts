import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStorageService } from './auth-storage.service';

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  userId: number;
  email: string;
  role: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.authServiceBaseUrl;

  constructor(
    private http: HttpClient,
    private authStorage: AuthStorageService
  ) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request);
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken });
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/reset-password`, request, { responseType: 'text' });
  }

  validateToken(): Observable<TokenValidationResponse> {
    const token = this.authStorage.getAccessToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<TokenValidationResponse>(`${this.baseUrl}/validate`, { headers });
  }

  loginWithGoogle(role: string): void {
    window.location.href = `${this.baseUrl}/oauth2/authorize/google?role=${role}`;
  }

  logout(): void {
    this.authStorage.clearSession();
  }
}