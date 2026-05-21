import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProfileComponent } from './profile';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

const mockProfileService = {
  getMyProfile: vi.fn(),
  updateProfile: vi.fn(),
  createProfile: vi.fn(),
  uploadResume: vi.fn(),
  parseResume: vi.fn(),
  downloadMyResume: vi.fn()
};
const mockToastService = { show: vi.fn() };
const mockAuthStorage = { getUserRole: vi.fn().mockReturnValue('CANDIDATE') };

const mockProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  skills: [{ name: 'Angular', level: 'Expert' }],
  resume: { fileName: 'resume.pdf', contentType: 'application/pdf', fileSize: 1024, uploadedAt: '2024-01-01' }
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockProfileService.getMyProfile.mockReturnValue(of(mockProfile));
    mockProfileService.uploadResume.mockReturnValue(of('Resume uploaded successfully!'));
    mockProfileService.parseResume.mockReturnValue(of({ extractedSkills: ['Angular'] }));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, FormsModule],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: ToastService, useValue: mockToastService },
        { provide: AuthStorageService, useValue: mockAuthStorage }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(mockProfileService.getMyProfile).toHaveBeenCalled();
    expect(component.profile.firstName).toBe('John');
  });

  it('should handle 404 profile not found (new user)', () => {
    vi.clearAllMocks();
    mockProfileService.getMyProfile.mockReturnValue(throwError(() => ({ status: 404 })));
    component.loadProfile();
    expect(component.profileExists).toBe(false);
    expect(component.isEditMode).toBe(true);
  });

  it('should compute fullName correctly', () => {
    expect(component.fullName).toBe('John Doe');
  });

  it('should compute initials correctly', () => {
    expect(component.initials).toBe('JD');
  });

  it('should toggle edit mode', () => {
    component.toggleEdit();
    expect(component.isEditMode).toBe(true);
    component.toggleEdit();
    expect(component.isEditMode).toBe(false);
  });

  it('should add skill in editable profile', () => {
    component.isEditMode = true;
    component.addSkill();
    expect(component.editableProfile.skills.length).toBe(2);
  });

  it('should call updateProfile if profile exists', () => {
    component.profileExists = true;
    mockProfileService.updateProfile.mockReturnValue(of(mockProfile));
    component.saveProfile();
    expect(mockProfileService.updateProfile).toHaveBeenCalled();
  });

  it('should call createProfile if profile does not exist', () => {
    component.profileExists = false;
    mockProfileService.createProfile.mockReturnValue(of(mockProfile));
    component.saveProfile();
    expect(mockProfileService.createProfile).toHaveBeenCalled();
  });

  it('should validate resume file type', () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as any;
    component.onResumeFileSelected(event);
    expect(component.resumeUploadError).toContain('Only PDF files are allowed');
    expect(component.selectedResumeFile).toBeNull();
  });

  it('should accept valid resume PDF', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } } as any;
    component.onResumeFileSelected(event);
    expect(component.resumeUploadError).toBe('');
    expect(component.selectedResumeFile).toBeNull();
    expect(mockProfileService.uploadResume).toHaveBeenCalledWith(file);
  });
});
