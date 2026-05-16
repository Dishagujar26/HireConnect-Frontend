import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recommended-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recommended-jobs.html',
  styleUrl: './recommended-jobs.css'
})
export class RecommendedJobsComponent implements OnInit {
  recommendedJobs: any[] = [];
  filteredRecommendedJobs: any[] = [];
  isLoading = true;
  profileExists = false;
  searchTerm = '';
  activeFilter: 'ALL' | 'APPLIED' | 'NOT_APPLIED' = 'NOT_APPLIED';
  appliedJobIds = new Set<number>();
  applyingJobIds = new Set<number>();

  constructor(
    private jobService: JobService,
    private profileService: ProfileService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileExists = true;
        const skills = profile.skills?.map((s: any) => s.name) || [];
        
        if (skills.length > 0) {
          // Fetch up to 50 recommendations for the dedicated page
          this.jobService.getRecommendedJobs(skills, 50).subscribe({
            next: (jobs) => {
              this.recommendedJobs = jobs.filter((j: any) => j.matchScore > 0);
              this.loadMyApplications();
            },
            error: () => {
              this.toastService.show('Failed to load recommended jobs', 'error');
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.profileExists = false;
        this.isLoading = false;
      }
    });
  }

  loadMyApplications(): void {
    this.jobService.getMyApplications().subscribe({
      next: (applications: any[]) => {
        this.appliedJobIds = new Set(
          applications.map(app => Number(app.jobId))
        );
        // [Disha Gujar] : Filter out jobs already applied to
        this.recommendedJobs = this.recommendedJobs.filter(
          rec => !this.isApplied(rec.job.jobId)
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const value = this.searchTerm.toLowerCase().trim();
    let result = [...this.recommendedJobs];

    if (value) {
      result = result.filter(rec =>
        rec.job.title?.toLowerCase().includes(value) ||
        rec.job.companyName?.toLowerCase().includes(value) ||
        rec.job.location?.toLowerCase().includes(value) ||
        rec.job.jobType?.toLowerCase().includes(value) ||
        rec.job.skillsRequired?.toLowerCase().includes(value)
      );
    }

    if (this.activeFilter === 'APPLIED') {
      // This case is unlikely for recommendations but added for consistency
      result = result.filter(rec => this.isApplied(rec.job.jobId));
    } else if (this.activeFilter === 'NOT_APPLIED') {
      result = result.filter(rec => !this.isApplied(rec.job.jobId));
    }

    this.filteredRecommendedJobs = result;
  }

  setFilter(filter: 'ALL' | 'APPLIED' | 'NOT_APPLIED'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  isApplied(jobId: number): boolean {
    return this.appliedJobIds.has(Number(jobId));
  }

  isApplying(jobId: number): boolean {
    return this.applyingJobIds.has(Number(jobId));
  }

  applyToJob(jobId: number, event: Event): void {
    event.stopPropagation(); // Don't navigate to details when clicking apply
    
    if (this.isApplied(jobId) || this.isApplying(jobId)) {
      return;
    }

    this.applyingJobIds.add(jobId);

    this.jobService.applyToJob(jobId).subscribe({
      next: () => {
        this.applyingJobIds.delete(jobId);
        this.appliedJobIds.add(Number(jobId));
        // Remove from recommendations after applying
        this.recommendedJobs = this.recommendedJobs.filter(
          rec => rec.job.jobId !== jobId
        );
        this.applyFilters();
        this.toastService.show('Application submitted successfully', 'success');
      },
      error: (error: any) => {
        this.applyingJobIds.delete(jobId);
        const message = error?.error?.message || 'Failed to apply for job';
        this.toastService.show(message, 'error');
      }
    });
  }

  getMatchBadgeClass(score: number): string {
    if (score >= 70) return 'match-high';
    if (score >= 40) return 'match-medium';
    return 'match-low';
  }
}
