import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RecruiterBillingComponent } from './recruiter-billing';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';

import { PaymentResponse } from '../../../core/services/payment.service';

const mockPaymentService = { getMyPayments: vi.fn() };
const mockToastService = { show: vi.fn() };

const mockPayments: PaymentResponse[] = [
  { id: 1, amount: 100, status: 'SUCCESS', purpose: 'JOB_POSTING_PLAN', referenceId: 101, currency: 'INR', providerOrderId: 'order_1', description: 'desc', createdAt: '2024-01-01' },
  { id: 2, amount: 50, status: 'FAILED', purpose: 'FEATURED_JOB', referenceId: 102, currency: 'INR', providerOrderId: 'order_2', description: 'desc', createdAt: '2024-01-02' },
  { id: 3, amount: 200, status: 'SUCCESS', purpose: 'RECRUITER_SUBSCRIPTION', referenceId: 103, currency: 'INR', providerOrderId: 'order_3', description: 'desc', createdAt: '2024-01-03' }
];

describe('RecruiterBillingComponent', () => {
  let component: RecruiterBillingComponent;
  let fixture: ComponentFixture<RecruiterBillingComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPaymentService.getMyPayments.mockReturnValue(of(mockPayments));

    await TestBed.configureTestingModule({
      imports: [RecruiterBillingComponent],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load payments on init', () => {
    expect(mockPaymentService.getMyPayments).toHaveBeenCalled();
    expect(component.payments.length).toBe(3);
  });

  it('should compute successCount correctly', () => {
    expect(component.successCount).toBe(2);
  });

  it('should compute failedCount correctly', () => {
    expect(component.failedCount).toBe(1);
  });

  it('should compute totalAmountPaid correctly', () => {
    expect(component.totalAmountPaid).toBe(300);
  });

  it('should format purpose correctly', () => {
    expect(component.formatPurpose('JOB_POSTING')).toBe('Job Posting');
    expect(component.formatPurpose('FEATURED_AD')).toBe('Featured Ad');
  });

  it('should handle load error', async () => {
    vi.clearAllMocks();
    mockPaymentService.getMyPayments.mockReturnValue(throwError(() => ({ error: { message: 'Err' } })));
    component.loadPayments();
    await fixture.whenStable();
    expect(mockToastService.show).toHaveBeenCalledWith('Err', 'error');
    expect(component.payments.length).toBe(0);
  });
});
