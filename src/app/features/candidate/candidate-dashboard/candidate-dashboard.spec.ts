import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CandidateDashboard } from './candidate-dashboard';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';
import { JobService } from '../../../core/services/job.service';
import { ProfileService } from '../../../core/services/profile.service';

// ─── Mock Factories ────────────────────────────────────────────────────────────
const mockAuthService = {
  logout: vi.fn()
};

const mockAuthStorage = {
  getUserEmail: vi.fn().mockReturnValue('candidate@hireconnect.com')
};

const mockJobService = {
  getRecommendedJobs: vi.fn()
};

const mockProfileService = {
  getMyProfile: vi.fn()
};

const mockRouter = { navigate: vi.fn().mockResolvedValue(true) };

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('CandidateDashboard', () => {
  let component: CandidateDashboard;
  let fixture: ComponentFixture<CandidateDashboard>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Default: profile with skills
    mockProfileService.getMyProfile.mockReturnValue(of({
      skills: [{ name: 'Angular' }, { name: 'TypeScript' }]
    }));
    mockJobService.getRecommendedJobs.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CandidateDashboard],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStorageService, useValue: mockAuthStorage },
        { provide: JobService, useValue: mockJobService },
        { provide: ProfileService, useValue: mockProfileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateDashboard);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // ── Initialization ─────────────────────────────────────────────────────────────
  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load user email from authStorage on construction', () => {
      expect(component.userEmail).toBe('candidate@hireconnect.com');
    });

    it('should call loadRecommendations on ngOnInit', () => {
      expect(mockProfileService.getMyProfile).toHaveBeenCalled();
    });
  });

  // ── Load Recommendations ──────────────────────────────────────────────────────
  describe('loadRecommendations()', () => {
    it('should set profileExists to true when profile is fetched', async () => {
      expect(component.profileExists).toBe(true);
    });

    it('should call getRecommendedJobs with extracted skill names', () => {
      expect(mockJobService.getRecommendedJobs).toHaveBeenCalledWith(
        ['Angular', 'TypeScript'], 3
      );
    });

    it('should set isLoading to false after recommendations are loaded', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should set recommendedJobs from API response', async () => {
      const jobs = [{ jobId: 1, title: 'Angular Dev', matchScore: 80 }, { jobId: 2, title: 'TS Dev', matchScore: 90 }];
      mockProfileService.getMyProfile.mockReturnValue(of({ skills: [{ name: 'Angular' }] }));
      mockJobService.getRecommendedJobs.mockReturnValue(of(jobs));

      component.loadRecommendations();
      await fixture.whenStable();

      expect(component.recommendedJobs).toEqual(jobs);
    });

    it('should not call getRecommendedJobs when profile has no skills', async () => {
      vi.clearAllMocks();
      mockProfileService.getMyProfile.mockReturnValue(of({ skills: [] }));
      component.loadRecommendations();
      await fixture.whenStable();
      expect(mockJobService.getRecommendedJobs).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should not call getRecommendedJobs when profile skills are null', async () => {
      vi.clearAllMocks();
      mockProfileService.getMyProfile.mockReturnValue(of({ skills: null }));
      component.loadRecommendations();
      await fixture.whenStable();
      expect(mockJobService.getRecommendedJobs).not.toHaveBeenCalled();
    });

    it('should set profileExists to false when profile fetch fails', async () => {
      vi.clearAllMocks();
      mockProfileService.getMyProfile.mockReturnValue(throwError(() => new Error('Not found')));
      component.loadRecommendations();
      await fixture.whenStable();
      expect(component.profileExists).toBe(false);
      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading to false when getRecommendedJobs errors', async () => {
      vi.clearAllMocks();
      mockProfileService.getMyProfile.mockReturnValue(of({ skills: [{ name: 'Java' }] }));
      mockJobService.getRecommendedJobs.mockReturnValue(throwError(() => new Error('API error')));
      component.loadRecommendations();
      await fixture.whenStable();
      expect(component.isLoading).toBe(false);
    });
  });

  // ── Match Badge Class ─────────────────────────────────────────────────────────
  describe('getMatchBadgeClass()', () => {
    it('should return "match-high" for score >= 70', () => {
      expect(component.getMatchBadgeClass(70)).toBe('match-high');
      expect(component.getMatchBadgeClass(100)).toBe('match-high');
      expect(component.getMatchBadgeClass(85)).toBe('match-high');
    });

    it('should return "match-medium" for score between 40 and 69', () => {
      expect(component.getMatchBadgeClass(40)).toBe('match-medium');
      expect(component.getMatchBadgeClass(55)).toBe('match-medium');
      expect(component.getMatchBadgeClass(69)).toBe('match-medium');
    });

    it('should return "match-low" for score below 40', () => {
      expect(component.getMatchBadgeClass(0)).toBe('match-low');
      expect(component.getMatchBadgeClass(39)).toBe('match-low');
      expect(component.getMatchBadgeClass(20)).toBe('match-low');
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should call authService.logout', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should navigate to /login after logout', () => {
      component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
