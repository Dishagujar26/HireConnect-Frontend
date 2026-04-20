import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  email = '';
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.successMessage = response;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/reset-password'], {
            queryParams: { email: this.email }
          });
        }, 1200);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || error?.error || 'Failed to send OTP';
        this.isLoading = false;
      }
    });
  }
}