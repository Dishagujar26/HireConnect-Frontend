import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RecruiterApplicationsComponent } from './applications';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';

const mockApplicationService = { getRecruiterApplications: vi.fn() };
const mockToastService = { show: vi.fn() };

const mockApplications = [
  { applicationId: 1, status: 'APPLIED' },
  { applicationId: 2, status: 'SHORTLISTED' },
  { applicationId: 3, status: 'REJECTED' },
  { applicationId: 4, status: 'ACCEPTED' }
];

describe('RecruiterApplicationsComponent', () => {
  let component: RecruiterApplicationsComponent;
  let fixture: ComponentFixture<RecruiterApplicationsComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockApplicationService.getRecruiterApplications.mockReturnValue(of(mockApplications));

    await TestBed.configureTestingModule({
      imports: [RecruiterApplicationsComponent],
      providers: [
        provideRouter([]),
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load applications on init', () => {
    expect(mockApplicationService.getRecruiterApplications).toHaveBeenCalled();
  });

  it('should set applications from API response', () => {
    expect(component.applications.length).toBe(4);
  });

  it('should compute total correctly', () => {
    expect(component.total).toBe(4);
  });

  it('should compute shortlisted count correctly', () => {
    expect(component.shortlisted).toBe(1);
  });

  it('should compute rejected count correctly', () => {
    expect(component.rejected).toBe(1);
  });

  it('should compute pending count correctly', () => {
    expect(component.pending).toBe(1);
  });

  it('should return OFFER SENT for ACCEPTED status', () => {
    expect(component.getStatusLabel('ACCEPTED')).toBe('OFFER SENT');
  });

  it('should return ACCEPTED for OFFER_ACCEPTED status', () => {
    expect(component.getStatusLabel('OFFER_ACCEPTED')).toBe('ACCEPTED');
  });

  it('should return REJECTED BY CANDIDATE for OFFER_REJECTED status', () => {
    expect(component.getStatusLabel('OFFER_REJECTED')).toBe('REJECTED BY CANDIDATE');
  });

  it('should return original status for other values', () => {
    expect(component.getStatusLabel('SHORTLISTED')).toBe('SHORTLISTED');
  });

  it('should show toast on load failure', async () => {
    vi.clearAllMocks();
    mockApplicationService.getRecruiterApplications.mockReturnValue(throwError(() => new Error('fail')));
    component.loadApplications();
    await fixture.whenStable();
    expect(mockToastService.show).toHaveBeenCalledWith('Failed to load applications', 'error');
  });
});
