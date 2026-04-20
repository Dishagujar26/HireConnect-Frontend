import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastModal } from './toast-modal';

describe('ToastModal', () => {
  let component: ToastModal;
  let fixture: ComponentFixture<ToastModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
