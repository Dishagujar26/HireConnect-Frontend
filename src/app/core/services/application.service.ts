import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CandidateProfilePreview {
  userId: number;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  profilePictureUrl: string;
  resumeUrl: string;
}

export interface RecruiterJobApplicationResponse {
  applicationId: number;
  candidateId: number;
  jobId: number;
  status: string;
  appliedAt: string;
  candidateProfile?: CandidateProfilePreview;
}

export interface CandidateApplicationResponse {
  applicationId: number;
  jobId: number;
  candidateId?: number;
  status: string;
  appliedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private baseUrl = 'http://localhost:8080/api/applications';

  constructor(private http: HttpClient) {}

  applyToJob(jobId: number): Observable<any> {
    return this.http.post(this.baseUrl, { jobId });
  }

  getMyApplications(): Observable<CandidateApplicationResponse[]> {
    return this.http.get<CandidateApplicationResponse[]>(`${this.baseUrl}/me`);
  }

  getRecruiterApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/recruiter`);
  }

  getApplicationsByJob(jobId: number): Observable<RecruiterJobApplicationResponse[]> {
    return this.http.get<RecruiterJobApplicationResponse[]>(
      `${this.baseUrl}/recruiter/job/${jobId}`
    );
  }

  updateStatus(applicationId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${applicationId}/status`,
      { status },
      { responseType: 'json' }
    );
  }
}