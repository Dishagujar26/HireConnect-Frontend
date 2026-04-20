import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PaymentPurpose =
  | 'FEATURED_JOB'
  | 'JOB_POSTING_PLAN'
  | 'RECRUITER_SUBSCRIPTION';

export type PaymentStatus = 'CREATED' | 'SUCCESS' | 'FAILED';

export interface CreatePaymentOrderRequest {
  purpose: PaymentPurpose;
  referenceId: number;
  amount: number;
  description?: string;
}

export interface PaymentOrderResponse {
  paymentId: number;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  email: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentResponse {
  id: number;
  purpose: PaymentPurpose;
  referenceId: number;
  amount: number;
  currency: string;
  providerOrderId: string;
  providerPaymentId?: string;
  status: PaymentStatus;
  description: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = environment.paymentServiceBaseUrl;

  constructor(private http: HttpClient) {}

  createOrder(request: CreatePaymentOrderRequest): Observable<PaymentOrderResponse> {
    return this.http.post<PaymentOrderResponse>(`${this.baseUrl}/create-order`, request);
  }

  verifyPayment(request: VerifyPaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/verify`, request);
  }

  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.baseUrl}/me`);
  }
}