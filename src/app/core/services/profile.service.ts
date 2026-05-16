import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumeInfo {
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:8080/api/profiles';

  constructor(private http: HttpClient) {}

  // [Disha Gujar] : Profile Operations

  getMyProfile() {
    return this.http.get<any>(`${this.baseUrl}/me`);
  }

  // [Disha Gujar] : Create a brand-new profile (POST /api/profiles).
  createProfile(data: any) {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.baseUrl}/me`, data);
  }

  // [Disha Gujar] : Returns the comprehensive candidate profile for a recruiter to review.
  // [Disha Gujar] : Backend verifies job ownership + candidate application before returning.
  getCandidateFullProfile(candidateId: number, jobId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/recruiter/candidates/${candidateId}/full?jobId=${jobId}`
    );
  }

  // [Disha Gujar] : Resume — Candidate Operations

  uploadResume(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/resume/upload`, formData, {
      responseType: 'text'
    });
  }

  // [Disha Gujar] : Download the candidate's own resume as a binary blob.
  downloadMyResume(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/resume/my`, {
      responseType: 'blob'
    });
  }

  // [Disha Gujar] : Resume — Recruiter Operations

  // [Disha Gujar] : Download a specific candidate's resume as a recruiter.
  downloadResumeForRecruiter(candidateId: number, jobId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/resume/recruiter/${candidateId}/${jobId}`,
      { responseType: 'blob' }
    );
  }

  // [Smart Features] : Parse the candidate's uploaded resume to extract skills
  parseResume(): Observable<{ extractedSkills: string[], suggestedHeadline?: string }> {
    return this.http.post<{ extractedSkills: string[], suggestedHeadline?: string }>(
      `${this.baseUrl}/resume/parse`,
      {}
    );
  }
}