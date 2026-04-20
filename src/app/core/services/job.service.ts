import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobRequest {
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  skillsRequired: string;
  status: string;
}

export interface JobResponse {
  jobId: number;
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  skillsRequired: string;
  status: string;
  recruiterId?: number;
  createdAt?: string;
  updatedAt?: string;
  isFeatured?: boolean;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
}

export interface ApplicationResponse {
  id?: number;
  applicationId?: number;
  jobId: number;
  candidateId?: number;
  recruiterId?: number;
  status?: string;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  appliedAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private jobsBaseUrl = 'http://localhost:8080/api/jobs';
  private applicationsBaseUrl = 'http://localhost:8080/api/applications';

  constructor(private http: HttpClient) {}

  getRecruiterJobs(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.jobsBaseUrl}/recruiter/me`);
  }

  createJob(request: JobRequest): Observable<JobResponse> {
    return this.http.post<JobResponse>(this.jobsBaseUrl, request);
  }

  updateJob(jobId: number, request: JobRequest): Observable<JobResponse> {
    return this.http.put<JobResponse>(`${this.jobsBaseUrl}/${jobId}`, request);
  }

  deleteJob(jobId: number): Observable<string> {
    return this.http.delete(`${this.jobsBaseUrl}/${jobId}`, {
      responseType: 'text'
    });
  }

  getOpenJobs(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(this.jobsBaseUrl);
  }

  getJobById(jobId: number): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.jobsBaseUrl}/${jobId}`);
  }

  searchJobs(filters: JobSearchParams): Observable<JobResponse[]> {
    let params = new HttpParams();

    if (filters.keyword) {
      params = params.set('keyword', filters.keyword);
    }
    if (filters.location) {
      params = params.set('location', filters.location);
    }
    if (filters.jobType) {
      params = params.set('jobType', filters.jobType);
    }
    if (filters.experienceLevel) {
      params = params.set('experienceLevel', filters.experienceLevel);
    }
    if (filters.minSalary !== undefined && filters.minSalary !== null) {
      params = params.set('minSalary', filters.minSalary.toString());
    }
    if (filters.maxSalary !== undefined && filters.maxSalary !== null) {
      params = params.set('maxSalary', filters.maxSalary.toString());
    }

    return this.http.get<JobResponse[]>(`${this.jobsBaseUrl}/search`, { params });
  }

  markJobAsFeatured(jobId: number): Observable<any> {
    return this.http.put(`${this.jobsBaseUrl}/${jobId}/feature`, {});
  }

  getMyApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.applicationsBaseUrl}/me`);
  }

  applyToJob(jobId: number): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.applicationsBaseUrl, {
      jobId,
      resumeUrl: '',
      coverLetter: ''
    });
  }
}