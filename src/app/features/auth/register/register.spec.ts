import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RegisterComponent } from './register';
import { AuthService } from '../../../core/services/auth.service';

// ─── Mock Factory ──────────────────────────────────────────────────────────────
const mockAuthService = {
  register: vi.fn(),
  loginWithGoogle: vi.fn()
};

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  // ── Initialization ────────────────────────────────────────────────────────────
  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize email and password as empty strings', () => {
      expect(component.email).toBe('');
      expect(component.password).toBe('');
    });

    it('should initialize role as CANDIDATE', () => {
      expect(component.role).toBe('CANDIDATE');
    });

    it('should initialize isLoading as false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize messages as empty strings', () => {
      expect(component.successMessage).toBe('');
      expect(component.errorMessage).toBe('');
    });
  });

  // ── Role Selection ─────────────────────────────────────────────────────────────
  describe('selectRole()', () => {
    it('should set role to RECRUITER', () => {
      component.selectRole('RECRUITER');
      expect(component.role).toBe('RECRUITER');
    });

    it('should set role to CANDIDATE', () => {
      component.selectRole('RECRUITER');
      component.selectRole('CANDIDATE');
      expect(component.role).toBe('CANDIDATE');
    });

    it('should overwrite the previous role selection', () => {
      component.selectRole('RECRUITER');
      component.selectRole('CANDIDATE');
      expect(component.role).toBe('CANDIDATE');
    });
  });

  // ── Registration Flow ─────────────────────────────────────────────────────────
  describe('onRegister()', () => {
    it('should clear messages and set isLoading before calling API', () => {
      component.errorMessage = 'Previous error';
      component.successMessage = 'Previous success';
      mockAuthService.register.mockReturnValue(of({ message: 'Registered!' }));
      component.onRegister();
      expect(component.errorMessage).toBe('');
    });

    it('should call authService.register with correct request payload', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'OK' }));
      component.email = 'new@hire.com';
      component.password = 'secure123';
      component.role = 'RECRUITER';
      component.onRegister();
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'new@hire.com',
        password: 'secure123',
        role: 'RECRUITER'
      });
    });

    it('should set successMessage from API response', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'Registration successful!' }));
      component.onRegister();
      expect(component.successMessage).toBe('Registration successful!');
    });

    it('should set isLoading to false after successful registration', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'Done' }));
      component.onRegister();
      expect(component.isLoading).toBe(false);
    });

    it('should set errorMessage on registration failure', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Email already exists' } }))
      );
      component.onRegister();
      expect(component.errorMessage).toBe('Email already exists');
      expect(component.isLoading).toBe(false);
    });

    it('should use default error message when error has no message', () => {
      mockAuthService.register.mockReturnValue(throwError(() => ({})));
      component.onRegister();
      expect(component.errorMessage).toBe('Registration failed');
    });

    it('should call authService.register once per submit', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'OK' }));
      component.onRegister();
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    });
  });

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  describe('continueWithGoogle()', () => {
    it('should call loginWithGoogle with current role (CANDIDATE)', () => {
      component.role = 'CANDIDATE';
      component.continueWithGoogle();
      expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith('CANDIDATE');
    });

    it('should call loginWithGoogle with current role (RECRUITER)', () => {
      component.role = 'RECRUITER';
      component.continueWithGoogle();
      expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith('RECRUITER');
    });
  });
});
