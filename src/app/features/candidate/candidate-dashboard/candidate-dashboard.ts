import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { JobService } from '../../../core/services/job.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './candidate-dashboard.html',
  styleUrl: './candidate-dashboard.css'
})
export class CandidateDashboard implements OnInit {
  userEmail: string | null;
  recommendedJobs: any[] = [];
  isLoading = true;
  profileExists = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private authStorage: AuthStorageService,
    private jobService: JobService,
    private profileService: ProfileService
  ) {
    this.userEmail = this.authStorage.getUserEmail();
  }

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileExists = true;
        const skills = profile.skills?.map((s: any) => s.name) || [];
        if (skills.length > 0) {
          this.jobService.getRecommendedJobs(skills, 3).subscribe({
            next: (jobs) => {
              this.recommendedJobs = jobs.filter((j: any) => j.matchScore > 0);
              this.isLoading = false;
            },
            error: () => this.isLoading = false
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

  getMatchBadgeClass(score: number): string {
    if (score >= 70) return 'match-high';
    if (score >= 40) return 'match-medium';
    return 'match-low';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}