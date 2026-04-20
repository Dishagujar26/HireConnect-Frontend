import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  otp = '';
  newPassword = '';
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email') || '';
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.resetPassword({
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: (response) => {
        this.successMessage = response;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.error || 'Password reset failed';
        this.isLoading = false;
      }
    });
  }
}