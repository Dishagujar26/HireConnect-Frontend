import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStorageService } from '../../../core/services/auth-storage.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  profile: any = {};
  editableProfile: any = {};

  isEditMode = false;
  isLoading = false;
  profileExists = true;   // [Disha Gujar] : false for newly registered users with no profile yet
  userRole = '';

  // [Disha Gujar] : Resume Upload State ───────────────────────────────────────────────────
  selectedResumeFile: File | null = null;
  isUploadingResume = false;
  isDownloadingResume = false;
  resumeUploadError = '';
  resumeUploadSuccess = '';

  constructor(
    private profileService: ProfileService,
    private toastService: ToastService,
    private authStorage: AuthStorageService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authStorage.getUserRole() || '';
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;

    this.profileService.getMyProfile().subscribe({
      next: (response) => {
        this.profile = response || {};
        this.profileExists = true;
        this.editableProfile = this.buildEditableProfile(this.profile);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 404) {
          // [Disha Gujar] : New user — no profile yet, start in edit mode automatically
          this.profileExists = false;
          this.profile = {};
          this.editableProfile = this.buildEditableProfile({});
          this.isEditMode = true;
        } else {
          this.toastService.show('Failed to load profile', 'error');
        }
      }
    });
  }

  buildEditableProfile(source: any): any {
    return {
      ...source,
      recruiterDetail: source?.recruiterDetail ? { ...source.recruiterDetail } : {},
      resume: source?.resume || {},
      skills: source?.skills ? source.skills.map((s: any) => ({ ...s })) : [],
      educations: source?.educations ? source.educations.map((e: any) => ({ ...e })) : [],
      experiences: source?.experiences ? source.experiences.map((e: any) => ({ ...e })) : [],
      socialLinks: source?.socialLinks ? source.socialLinks.map((l: any) => ({ ...l })) : []
    };
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.editableProfile = this.buildEditableProfile(this.profile);
      this.selectedResumeFile = null;
      this.resumeUploadError = '';
      this.resumeUploadSuccess = '';
    }
  }

  saveProfile(): void {
    const payload: any = {
      firstName: this.editableProfile.firstName || '',
      lastName: this.editableProfile.lastName || '',
      phone: this.editableProfile.phone || '',
      headline: this.editableProfile.headline || '',
      location: this.editableProfile.location || '',
      about: this.editableProfile.about || '',
      profilePictureUrl: this.editableProfile.profilePictureUrl || ''
    };

    if (this.isRecruiter) {
      const recruiterDetail = this.editableProfile.recruiterDetail || {};

      if (
        recruiterDetail.companyName ||
        recruiterDetail.website ||
        recruiterDetail.companyDescription ||
        recruiterDetail.designation
      ) {
        payload.recruiterDetail = {
          companyName: recruiterDetail.companyName || '',
          website: recruiterDetail.website || '',
          companyDescription: recruiterDetail.companyDescription || '',
          designation: recruiterDetail.designation || ''
        };
      }
    }

    if (this.isCandidate) {
      payload.skills = this.editableProfile.skills || [];
      payload.educations = this.editableProfile.educations || [];
      payload.experiences = this.editableProfile.experiences || [];
      payload.socialLinks = this.editableProfile.socialLinks || [];
    }

    // [Disha Gujar] : Choose POST (create) or PUT (update) based on whether profile already exists
    const request$ = this.profileExists
      ? this.profileService.updateProfile(payload)
      : this.profileService.createProfile(payload);

    request$.subscribe({
      next: (response) => {
        this.profile = response || payload;
        this.profileExists = true;
        this.editableProfile = this.buildEditableProfile(this.profile);
        this.isEditMode = false;
        this.toastService.show('Profile saved successfully', 'success');
      },
      error: () => {
        this.toastService.show('Failed to save profile', 'error');
      }
    });
  }

  // [Disha Gujar] : Skills Section ────────────────────────────────────────────────────────────────

  addSkill(): void {
    this.editableProfile.skills = this.editableProfile.skills || [];
    this.editableProfile.skills.push({ name: '', level: '' });
  }

  removeSkill(index: number): void {
    this.editableProfile.skills.splice(index, 1);
  }

  // [Disha Gujar] : Education Section ────────────────────────────────────────────────────────────

  addEducation(): void {
    this.editableProfile.educations = this.editableProfile.educations || [];
    this.editableProfile.educations.push({
      institution: '', degree: '', fieldOfStudy: '',
      startDate: '', endDate: '', grade: '', description: ''
    });
  }

  removeEducation(index: number): void {
    this.editableProfile.educations.splice(index, 1);
  }

  // [Disha Gujar] : Experience Section ───────────────────────────────────────────────────────────

  addExperience(): void {
    this.editableProfile.experiences = this.editableProfile.experiences || [];
    this.editableProfile.experiences.push({
      companyName: '', jobTitle: '', employmentType: '', location: '',
      startDate: '', endDate: '', currentlyWorking: false, description: ''
    });
  }

  removeExperience(index: number): void {
    this.editableProfile.experiences.splice(index, 1);
  }

  // [Disha Gujar] : Social Links Section ──────────────────────────────────────────────────────────

  addSocialLink(): void {
    this.editableProfile.socialLinks = this.editableProfile.socialLinks || [];
    this.editableProfile.socialLinks.push({ platform: '', url: '' });
  }

  removeSocialLink(index: number): void {
    this.editableProfile.socialLinks.splice(index, 1);
  }

  // [Disha Gujar] : Resume Upload Operations ─────────────────────────────────────────────────────────

  onResumeFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // [Disha Gujar] : Backend only accepts PDF
    if (file.type !== 'application/pdf') {
      this.resumeUploadError = 'Only PDF files are allowed. Please select a PDF document.';
      this.selectedResumeFile = null;
      return;
    }

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.resumeUploadError = `File size must be under ${maxSizeMB}MB.`;
      this.selectedResumeFile = null;
      return;
    }

    this.resumeUploadError = '';
    this.resumeUploadSuccess = '';
    this.selectedResumeFile = file;
  }

  uploadResume(): void {
    if (!this.selectedResumeFile) return;

    this.isUploadingResume = true;
    this.resumeUploadError = '';
    this.resumeUploadSuccess = '';

    this.profileService.uploadResume(this.selectedResumeFile).subscribe({
      next: (message) => {
        this.isUploadingResume = false;
        this.resumeUploadSuccess = message || 'Resume uploaded successfully!';
        this.toastService.show('Resume uploaded successfully', 'success');
        this.selectedResumeFile = null;
        // [Disha Gujar] : Reload profile so resume info refreshes
        this.loadProfile();
      },
      error: (err) => {
        this.isUploadingResume = false;
        this.resumeUploadError = err?.error || 'Failed to upload resume. Please try again.';
        this.toastService.show('Resume upload failed', 'error');
      }
    });
  }

  // [Disha Gujar] : Resume Download (Candidate) ───────────────────────────────────────────

  downloadMyResume(): void {
    this.isDownloadingResume = true;

    this.profileService.downloadMyResume().subscribe({
      next: (blob) => {
        this.isDownloadingResume = false;
        const fileName = this.profile?.resume?.fileName || 'my-resume.pdf';
        this.triggerBlobDownload(blob, fileName);
        this.toastService.show('Resume downloaded', 'success');
      },
      error: () => {
        this.isDownloadingResume = false;
        this.toastService.show('Failed to download resume', 'error');
      }
    });
  }

  // [Disha Gujar] : Helper — Trigger browser download from Blob ───────────────────────────

  private triggerBlobDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  // [Disha Gujar] : File Size Formatter ───────────────────────────────────────────────────

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // [Disha Gujar] : Computed getters ──────────────────────────────────────────────────────

  get hasUploadedResume(): boolean {
    return !!(this.profile?.resume?.fileName);
  }

  get fullName(): string {
    const firstName = this.profile?.firstName || '';
    const lastName = this.profile?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Your Name';
  }

  get roleTitle(): string {
    return this.userRole === 'RECRUITER' ? 'Recruiter Profile' : 'Candidate Profile';
  }

  get initials(): string {
    const first = this.profile?.firstName?.charAt(0) || '';
    const last = this.profile?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  get recruiterDetail(): any {
    return this.profile?.recruiterDetail || {};
  }

  get isRecruiter(): boolean {
    return this.userRole === 'RECRUITER';
  }

  get isCandidate(): boolean {
    return this.userRole === 'CANDIDATE';
  }
}