import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recruiter-dashboard.html',
  styleUrl: './recruiter-dashboard.css'
})
export class RecruiterDashboard {}