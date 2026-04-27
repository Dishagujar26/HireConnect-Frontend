import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { JobResponse, JobService } from '../../../../core/services/job.service';
import { ConfirmModalService } from '../../../../core/services/confirm-modal.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  PaymentOrderResponse,
  PaymentService
} from '../../../../core/services/payment.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type RecruiterJobFilter = 'ALL' | 'OPEN' | 'CLOSED' | 'FEATURED';

@Component({
  selector: 'app-recruiter-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recruiter-jobs.html',
  styleUrl: './recruiter-jobs.css'
})
export class RecruiterJobsComponent implements OnInit {
  jobs: JobResponse[] = [];
  filteredJobs: JobResponse[] = [];

  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  processingJobId: number | null = null;

  activeFilter: RecruiterJobFilter = 'ALL';

  constructor(
    private jobService: JobService,
    private confirmModalService: ConfirmModalService,
    private toastService: ToastService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobService.getRecruiterJobs().subscribe({
      next: (response: JobResponse[]) => {
        this.jobs = response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to load recruiter jobs';
        this.isLoading = false;
        this.toastService.show(this.errorMessage, 'error');
      }
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.applyFilters();
  }

  setFilter(filter: RecruiterJobFilter): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.jobs];

    if (this.searchTerm) {
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(this.searchTerm) ||
          job.location?.toLowerCase().includes(this.searchTerm) ||
          job.status?.toLowerCase().includes(this.searchTerm) ||
          job.jobType?.toLowerCase().includes(this.searchTerm) ||
          job.experienceLevel?.toLowerCase().includes(this.searchTerm)
      );
    }

    if (this.activeFilter === 'OPEN') {
      result = result.filter((job) => job.status === 'OPEN');
    } else if (this.activeFilter === 'CLOSED') {
      result = result.filter((job) => job.status === 'CLOSED');
    } else if (this.activeFilter === 'FEATURED') {
      result = result.filter((job) => !!job.isFeatured);
    }

    this.filteredJobs = result;
  }

  async deleteJob(jobId: number): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        this.jobs = this.jobs.filter((job) => job.jobId !== jobId);
        this.applyFilters();
        this.toastService.show('Job deleted successfully', 'success');
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to delete job';
        this.toastService.show(message, 'error');
      }
    });
  }

  promoteJob(job: JobResponse): void {
    this.processingJobId = job.jobId;

    this.paymentService
      .createOrder({
        purpose: 'FEATURED_JOB',
        referenceId: job.jobId,
        amount: 499,
        description: `Promote job: ${job.title}`
      })
      .subscribe({
        next: (order) => {
          if (order.orderId.startsWith('order_mock_')) {
            console.info('Mock order detected. Auto-verifying payment...');
            this.paymentService.verifyPayment({
              razorpayOrderId: order.orderId,
              razorpayPaymentId: 'pay_mock_' + Date.now(),
              razorpaySignature: 'sig_mock_' + Date.now()
            }).subscribe({
              next: () => {
                this.jobService.markJobAsFeatured(job.jobId).subscribe({
                  next: () => {
                    this.processingJobId = null;
                    this.toastService.show(`[MOCK] Job "${job.title}" is now featured.`, 'success');
                    setTimeout(() => window.location.reload(), 800);
                  }
                });
              },
              error: (err) => {
                this.processingJobId = null;
                this.toastService.show('Mock verification failed', 'error');
              }
            });
          } else {
            this.openRazorpay(job, order);
          }
        },
        error: (error) => {
          this.processingJobId = null;
          const message = error?.error?.message || 'Failed to create payment order';
          this.toastService.show(message, 'error');
        }
      });
  }

  private openRazorpay(job: JobResponse, order: PaymentOrderResponse): void {
    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency,
      name: 'HireConnect',
      description: order.description,
      order_id: order.orderId,
      prefill: {
        email: order.email
      },
      theme: {
        color: '#0f172a'
      },
      handler: (response: any) => {
        this.paymentService
          .verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })
          .subscribe({
            next: () => {
              this.jobService.markJobAsFeatured(job.jobId).subscribe({
                next: () => {
                  this.processingJobId = null;
                  this.toastService.show(
                    `Payment successful. "${job.title}" is now featured.`,
                    'success'
                  );

                  setTimeout(() => {
                    window.location.reload();
                  }, 800);
                },
                error: (error) => {
                  this.processingJobId = null;
                  const message =
                    error?.error?.message ||
                    'Payment succeeded but job could not be marked as featured';
                  this.toastService.show(message, 'error');
                }
              });
            },
            error: (error) => {
              this.processingJobId = null;
              const message = error?.error?.message || 'Payment verification failed';
              this.toastService.show(message, 'error');
            }
          });
      },
      modal: {
        ondismiss: () => {
          this.processingJobId = null;
          this.toastService.show('Payment cancelled', 'info');
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  get openJobsCount(): number {
    return this.jobs.filter((job) => job.status === 'OPEN').length;
  }

  get closedJobsCount(): number {
    return this.jobs.filter((job) => job.status === 'CLOSED').length;
  }
}