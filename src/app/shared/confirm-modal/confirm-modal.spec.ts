import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ConfirmModalComponent } from './confirm-modal';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

const mockModalService = {
  isOpen: false,
  config: { title: 'Test', message: 'Are you sure?', confirmText: 'Yes', cancelText: 'No', variant: 'primary' },
  open: vi.fn().mockResolvedValue(true)
};

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
      providers: [
        { provide: ConfirmModalService, useValue: mockModalService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the confirm modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ConfirmModalService as modalService', () => {
    expect(component.modalService).toBeTruthy();
  });
});
