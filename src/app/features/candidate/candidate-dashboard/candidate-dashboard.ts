import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './candidate-dashboard.html',
  styleUrl: './candidate-dashboard.css'
})
export class CandidateDashboard {
  userEmail: string | null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private authStorage: AuthStorageService
  ) {
    this.userEmail = this.authStorage.getUserEmail();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}