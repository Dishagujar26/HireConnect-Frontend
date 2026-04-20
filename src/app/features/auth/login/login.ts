import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  successMessage = '';
  errorMessage = '';

  showGoogleRoleSelector = false;
  selectedRole: 'CANDIDATE' | 'RECRUITER' = 'CANDIDATE';

  constructor(
    private authService: AuthService,
    private authStorage: AuthStorageService,
    private router: Router
  ) {}

  selectRole(role: 'CANDIDATE' | 'RECRUITER'): void {
    this.selectedRole = role;
  }

  onLogin(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    const request = {
      email: this.email,
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        this.authStorage.saveSession({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          email: response.email,
          role: response.role,
          userId: response.userId
        });

        this.successMessage = response.message;
        this.isLoading = false;

        if (response.role === 'CANDIDATE') {
          this.router.navigate(['/candidate/dashboard']);
        } else if (response.role === 'RECRUITER') {
          this.router.navigate(['/recruiter/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Login failed';

      }
    });
  }

  openGoogleRoleSelector(): void {
    this.showGoogleRoleSelector = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelGoogleRoleSelector(): void {
    this.showGoogleRoleSelector = false;
  }

  continueWithGoogle(): void {
    this.authService.loginWithGoogle(this.selectedRole);
  }
}