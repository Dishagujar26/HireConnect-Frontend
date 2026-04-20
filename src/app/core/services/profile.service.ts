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
  // [Disha Gujar] : Used on first save for users who registered but never created a profile.
  createProfile(data: any) {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.baseUrl}/me`, data);
  }

  // [Disha Gujar] : Resume — Candidate Operations

  // [Disha Gujar] : Upload a resume file (PDF) for the authenticated candidate.
  // [Disha Gujar] : Backend: POST /api/profiles/resume/upload (multipart/form-data)
  uploadResume(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/resume/upload`, formData, {
      responseType: 'text'
    });
  }

  // [Disha Gujar] : Download the candidate's own resume as a binary blob.
  // [Disha Gujar] : Backend: GET /api/profiles/resume/my
  downloadMyResume(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/resume/my`, {
      responseType: 'blob'
    });
  }

  // [Disha Gujar] : Resume — Recruiter Operations

  // [Disha Gujar] : Download a specific candidate's resume as a recruiter.
  // [Disha Gujar] : Requires the recruiter to own the job the candidate applied for.
  // [Disha Gujar] : Backend: GET /api/profiles/resume/recruiter/{candidateId}/{jobId}
  downloadResumeForRecruiter(candidateId: number, jobId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/resume/recruiter/${candidateId}/${jobId}`,
      { responseType: 'blob' }
    );
  }
}