import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

@Component({
  selector: 'app-oauth-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './oauth-success.html',
  styleUrl: './oauth-success.css'
})
export class OAuthSuccessComponent implements OnInit {
  errorMessage = 'Processing Google sign in...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authStorage: AuthStorageService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const error = params.get('error');
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      const email = params.get('email');
      const role = params.get('role');
      const userId = params.get('userId');

      if (error) {
        this.errorMessage = error;
        setTimeout(() => this.router.navigate(['/login']), 2000);
        return;
      }

      if (accessToken && refreshToken && email && role && userId) {
        this.authStorage.saveSession({
          accessToken,
          refreshToken,
          email,
          role,
          userId: Number(userId)
        });

        if (role === 'CANDIDATE') {
          this.router.navigate(['/candidate/dashboard']);
        } else if (role === 'RECRUITER') {
          this.router.navigate(['/recruiter/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      } else {
        this.errorMessage = 'Google sign in failed';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    });
  }
}