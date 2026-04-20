import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-modal.html',
  styleUrl: './toast-modal.css'
})
export class ToastModalComponent {
  toast: Toast | null = null;
  visible = false;
  private timeoutId: any;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe((toast) => {
      this.toast = toast;
      this.visible = true;

      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      this.timeoutId = setTimeout(() => {
        this.visible = false;
      }, 2500);
    });
  }
}