import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { EditJobComponent } from './edit-job';
import { JobService } from '../../../../core/services/job.service';
import { ToastService } from '../../../../core/services/toast.service';

import { JobResponse } from '../../../../core/services/job.service';

const mockJobService = {
  getJobById: vi.fn(),
  updateJob: vi.fn()
};
const mockToastService = { show: vi.fn() };
const mockRouter = { navigate: vi.fn() };

const mockJobResponse: JobResponse = {
  jobId: 1,
  title: 'Old Title',
  description: 'Desc',
  companyName: 'Co',
  location: 'Loc',
  jobType: 'FULL_TIME',
  experienceLevel: 'MID',
  salaryMin: 100,
  salaryMax: 200,
  skillsRequired: 'Java',
  status: 'OPEN'
};

describe('EditJobComponent', () => {
  let component: EditJobComponent;
  let fixture: ComponentFixture<EditJobComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockJobService.getJobById.mockReturnValue(of(mockJobResponse));

    await TestBed.configureTestingModule({
      imports: [EditJobComponent, FormsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        },
        { provide: Router, useValue: mockRouter },
        { provide: JobService, useValue: mockJobService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load job details on init', () => {
    expect(mockJobService.getJobById).toHaveBeenCalledWith(1);
    expect(component.job.title).toBe('Old Title');
  });

  it('should validate salary on submit', () => {
    component.job.salaryMin = 500;
    component.job.salaryMax = 400;
    component.onSubmit({ invalid: false } as any);
    expect(component.errorMessage).toBe('Minimum salary cannot be greater than maximum salary');
  });

  it('should call updateJob on valid submit', () => {
    mockJobService.updateJob.mockReturnValue(of({}));
    component.job.title = 'New Title';
    component.onSubmit({ invalid: false } as any);
    expect(mockJobService.updateJob).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'New Title' }));
    expect(mockToastService.show).toHaveBeenCalledWith('Job updated successfully', 'success');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/recruiter/jobs']);
  });

  it('should handle update error', () => {
    mockJobService.updateJob.mockReturnValue(throwError(() => ({ error: { message: 'Fail' } })));
    component.onSubmit({ invalid: false } as any);
    expect(mockToastService.show).toHaveBeenCalledWith('Fail', 'error');
    expect(component.isLoading).toBe(false);
  });
});
