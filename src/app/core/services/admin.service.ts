import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStorageService } from './auth-storage.service';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  userId: number;
  email: string;
  role: string;
  active: boolean;
}

export interface AdminStats {
  totalUsers: number;
  candidates: number;
  recruiters: number;
  activeUsers: number;
}

export interface JobStats {
  totalJobs: number;
}

export interface FinanceStats {
  totalRevenue: number;
  successCount: number;
}

export interface BroadcastRequest {
  title: string;
  message: string;
  userIds: number[];
}

export interface BroadcastResult {
  recipientCount: number;
  title: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private authAdminUrl = `${environment.apiBaseUrl}/api/v1/admin`;
  private jobAdminUrl  = `${environment.apiBaseUrl}/api/jobs/admin`;
  private notifAdminUrl = `${environment.apiBaseUrl}/api/notifications/admin`;
  private payAdminUrl = `${environment.apiBaseUrl}/api/payments/admin`;

  constructor(
    private http: HttpClient,
    private authStorage: AuthStorageService
  ) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authStorage.getAccessToken()}`
    });
  }

  // ── User Governance ────────────────────────────────────────────────────────

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.authAdminUrl}/users`, { headers: this.headers() });
  }

  getUserStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.authAdminUrl}/stats`, { headers: this.headers() });
  }

  suspendUser(userId: number): Observable<string> {
    return this.http.put(`${this.authAdminUrl}/users/${userId}/suspend`, {}, {
      headers: this.headers(), responseType: 'text'
    });
  }

  activateUser(userId: number): Observable<string> {
    return this.http.put(`${this.authAdminUrl}/users/${userId}/activate`, {}, {
      headers: this.headers(), responseType: 'text'
    });
  }

  // ── Job Moderation ──────────────────────────────────────────────────────────

  getAllJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.jobAdminUrl}/all`, { headers: this.headers() });
  }

  getJobStats(): Observable<JobStats> {
    return this.http.get<JobStats>(`${this.jobAdminUrl}/stats`, { headers: this.headers() });
  }

  deleteJob(jobId: number): Observable<string> {
    return this.http.delete(`${this.jobAdminUrl}/${jobId}`, {
      headers: this.headers(), responseType: 'text'
    });
  }

  // ── Broadcasting ────────────────────────────────────────────────────────────

  broadcastMessage(request: BroadcastRequest): Observable<BroadcastResult> {
    return this.http.post<BroadcastResult>(`${this.notifAdminUrl}/broadcast`, request, {
      headers: this.headers()
    });
  }

  // ── Finance Overview ──────────────────────────────────────────────────────

  getFinanceStats(): Observable<FinanceStats> {
    return this.http.get<FinanceStats>(`${this.payAdminUrl}/stats`, { headers: this.headers() });
  }

  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.payAdminUrl}/transactions`, { headers: this.headers() });
  }
}
