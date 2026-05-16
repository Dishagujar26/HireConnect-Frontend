import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { ToastModalComponent } from './toast-modal';
import { ToastService, Toast } from '../../core/services/toast.service';

describe('ToastModalComponent', () => {
  let component: ToastModalComponent;
  let fixture: ComponentFixture<ToastModalComponent>;
  let toastSubject: Subject<Toast>;

  beforeEach(async () => {
    toastSubject = new Subject<Toast>();

    await TestBed.configureTestingModule({
      imports: [ToastModalComponent],
      providers: [
        { provide: ToastService, useValue: { toast$: toastSubject.asObservable() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the toast modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with visible as false', () => {
    expect(component.visible).toBe(false);
  });

  it('should initialize with toast as null', () => {
    expect(component.toast).toBeNull();
  });

  it('should set toast and visible=true when toast$ emits', () => {
    const toast: Toast = { message: 'Success!', type: 'success' };
    toastSubject.next(toast);
    expect(component.toast).toEqual(toast);
    expect(component.visible).toBe(true);
  });

  it('should update toast when multiple toasts are emitted', () => {
    toastSubject.next({ message: 'First', type: 'success' });
    toastSubject.next({ message: 'Second', type: 'error' });
    expect(component.toast?.message).toBe('Second');
    expect(component.toast?.type).toBe('error');
  });
});
