import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  email = '';
  password = '';
  role = 'CANDIDATE';
  isLoading = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: string): void {
    this.role = role;
  }

  onRegister(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    const request = {
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Registration failed';
      }
    });
  }

  continueWithGoogle(): void {
    this.authService.loginWithGoogle(this.role);
  }
}