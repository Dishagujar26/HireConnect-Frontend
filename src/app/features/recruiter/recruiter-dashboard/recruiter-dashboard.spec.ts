import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecruiterDashboard } from './recruiter-dashboard';

// ─── Test Suite ────────────────────────────────────────────────────────────────
describe('RecruiterDashboard', () => {
  let component: RecruiterDashboard;
  let fixture: ComponentFixture<RecruiterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterDashboard],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // ── Creation ──────────────────────────────────────────────────────────────────
  describe('Component Initialization', () => {
    it('should create the recruiter dashboard component', () => {
      expect(component).toBeTruthy();
    });

    it('should be an instance of RecruiterDashboard', () => {
      expect(component).toBeInstanceOf(RecruiterDashboard);
    });
  });

  // ── Template ──────────────────────────────────────────────────────────────────
  describe('Template Rendering', () => {
    it('should render the dashboard container in the DOM', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });
  });
});
