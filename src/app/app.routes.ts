import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { OAuthSuccessComponent } from './features/auth/oauth-success/oauth-success';
import { CandidateDashboard } from './features/candidate/candidate-dashboard/candidate-dashboard';
import { RecruiterDashboard } from './features/recruiter/recruiter-dashboard/recruiter-dashboard';
import { LayoutComponent } from './features/layout/layout';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { RecruiterJobsComponent } from './features/recruiter/jobs/recruiter-jobs/recruiter-jobs';
import { CreateJobComponent } from './features/recruiter/jobs/create-job/create-job';
import { EditJobComponent } from './features/recruiter/jobs/edit-job/edit-job';
import { RecruiterJobApplicationsComponent } from './features/recruiter/job-applications/job-applications';
import { ScheduleInterviewComponent } from './features/recruiter/interviews/schedule-interview/schedule-interview';
import { RecruiterInterviewsComponent } from './features/recruiter/interviews/recruiter-interviews/recruiter-interviews';
import { RecruiterApplicationsComponent } from './features/recruiter/applications/applications';
import { NotificationsComponent } from './features/notifications/notifications';
import { ProfileComponent } from './features/profile/profile/profile';
import { CandidateJobsComponent } from './features/candidate/jobs/candidate-jobs/candidate-jobs';
import { JobDetailsComponent } from './features/candidate/jobs/job-details/job-details';
import { CandidateApplicationsComponent } from './features/candidate/applications/candidate-applications/candidate-applications';
import { CandidateInterviewsComponent } from './features/candidate/interviews/candidate-interviews/candidate-interviews';
import { RecruiterBillingComponent } from './features/recruiter/recruiter-billing/recruiter-billing';
import { CandidateProfilePageComponent } from './features/recruiter/candidate-profile-page/candidate-profile-page';
import { RecommendedJobsComponent } from './features/candidate/recommended-jobs/recommended-jobs';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard';
import { AdminUsersComponent } from './features/admin/admin-users/admin-users';
import { AdminJobsComponent } from './features/admin/admin-jobs/admin-jobs';
import { AdminBroadcastComponent } from './features/admin/admin-broadcast/admin-broadcast';
import { AdminFinanceComponent } from './features/admin/admin-finance/admin-finance';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [publicGuard] },
  { path: 'reset-password', component: ResetPasswordComponent, canActivate: [publicGuard] },
  { path: 'oauth-success', component: OAuthSuccessComponent, canActivate: [publicGuard] },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'candidate/dashboard', component: CandidateDashboard },

      { path: 'recruiter/dashboard', component: RecruiterDashboard },
      { path: 'recruiter/jobs', component: RecruiterJobsComponent },
      { path: 'recruiter/jobs/create', component: CreateJobComponent },
      { path: 'recruiter/jobs/:jobId/edit', component: EditJobComponent },
      { path: 'recruiter/jobs/:jobId/applications', component: RecruiterJobApplicationsComponent },
      { path: 'recruiter/candidates/:candidateId/job/:jobId', component: CandidateProfilePageComponent },
      { path: 'recruiter/applications', component: RecruiterApplicationsComponent },
      { path: 'recruiter/interviews', component: RecruiterInterviewsComponent },
      { path: 'recruiter/interviews/schedule/:applicationId', component: ScheduleInterviewComponent },
      { path: 'recruiter/interviews/edit/:interviewId', component: ScheduleInterviewComponent },

      { path: 'profile', component: ProfileComponent },
      { path: 'jobs/:jobId', component: JobDetailsComponent },
      { path: 'jobs', component: CandidateJobsComponent },
      { path: 'candidate/applications', component: CandidateApplicationsComponent },
      { path: 'candidate/recommended-jobs', component: RecommendedJobsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'candidate/interviews', component: CandidateInterviewsComponent },
      { path: 'recruiter/billing', component: RecruiterBillingComponent },

      // ── Admin Routes ──────────────────────────────────────────────────
      { path: 'admin/dashboard', component: AdminDashboardComponent },
      { path: 'admin/users', component: AdminUsersComponent },
      { path: 'admin/jobs', component: AdminJobsComponent },
      { path: 'admin/broadcast', component: AdminBroadcastComponent },
      { path: 'admin/finance', component: AdminFinanceComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }
];