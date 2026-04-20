import { Injectable } from '@angular/core';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  isOpen = false;

  config: ConfirmModalConfig = {
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary'
  };

  private resolver: ((value: boolean) => void) | null = null;

  open(config: ConfirmModalConfig): Promise<boolean> {
    this.config = {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'primary',
      ...config
    };

    this.isOpen = true;

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirm(): void {
    this.isOpen = false;
    this.resolver?.(true);
    this.resolver = null;
  }

  cancel(): void {
    this.isOpen = false;
    this.resolver?.(false);
    this.resolver = null;
  }
}