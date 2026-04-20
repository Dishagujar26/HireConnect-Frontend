import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterviewRequest {
  applicationId: number;
  title: string;
  interviewType: string;
  scheduledAt: string;
  durationMinutes: number;
  modeDetails: string;
  notes: string;
}

export interface InterviewResponse {
  id: number;
  applicationId: number;
  jobId?: number;
  candidateId?: number;
  recruiterId?: number;
  interviewType: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string | null;
  location?: string | null;
  modeDetails?: string | null;
  notes: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = 'http://localhost:8080/api/interviews';

  constructor(private http: HttpClient) {}

  scheduleInterview(request: InterviewRequest): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(this.baseUrl, request);
  }

  getRecruiterInterviews(): Observable<InterviewResponse[]> {
    return this.http.get<InterviewResponse[]>(`${this.baseUrl}/recruiter`);
  }

  getCandidateInterviews(): Observable<InterviewResponse[]> {
    return this.http.get<InterviewResponse[]>(`${this.baseUrl}/candidate`);
  }

  getInterviewDetails(interviewId: number): Observable<InterviewResponse> {
    return this.http.get<InterviewResponse>(`${this.baseUrl}/${interviewId}`);
  }

  cancelInterview(interviewId: number): Observable<InterviewResponse> {
    return this.http.put<InterviewResponse>(
      `${this.baseUrl}/${interviewId}/cancel`,
      {}
    );
  }

  formatInterviewType(type: string): string {
    return type?.replace(/_/g, ' ') || '';
  }

  getInterviewTitle(interview: InterviewResponse): string {
    return interview.title || `Interview #${interview.id}`;
  }

  getInterviewMode(interview: InterviewResponse): string {
    if (interview.meetingLink) {
      return interview.meetingLink;
    }

    if (interview.location) {
      return interview.location;
    }

    if (interview.modeDetails) {
      return interview.modeDetails;
    }

    return 'Details will be shared by recruiter';
  }
}