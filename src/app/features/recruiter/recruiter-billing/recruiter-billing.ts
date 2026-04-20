import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentResponse, PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recruiter-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-billing.html',
  styleUrl: './recruiter-billing.css'
})
export class RecruiterBillingComponent implements OnInit {
  payments: PaymentResponse[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getMyPayments().subscribe({
      next: (response: PaymentResponse[]) => {
        console.log('Payments API response:', response);
        this.payments = Array.isArray(response) ? response : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load payments:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Failed to load payment history';
        this.payments = [];
        this.isLoading = false;
        this.toastService.show(this.errorMessage, 'error');
      }
    });
  }

  get successCount(): number {
    return this.payments.filter(payment => payment.status === 'SUCCESS').length;
  }

  get failedCount(): number {
    return this.payments.filter(payment => payment.status === 'FAILED').length;
  }

  get createdCount(): number {
    return this.payments.filter(payment => payment.status === 'CREATED').length;
  }

  get totalAmountPaid(): number {
    return this.payments
      .filter(payment => payment.status === 'SUCCESS')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  formatPurpose(purpose: string): string {
  return purpose
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
  }
}
