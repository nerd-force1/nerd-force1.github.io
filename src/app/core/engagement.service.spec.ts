import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EngagementService } from './engagement.service';

describe('EngagementService', () => {
  let svc: EngagementService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EngagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(EngagementService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('POSTs a quote to /api/quotes', () => {
    svc
      .submitQuote({
        company: 'A',
        contact_name: 'B',
        email: 'b@a.com',
        selected_config: { modules: [], environments: 1 },
      })
      .subscribe();
    const req = http.expectOne('/api/quotes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.company).toBe('A');
    expect(req.request.body.contact_name).toBe('B');
    req.flush({ ok: true, id: 1 });
  });

  it('POSTs a callback to /api/callbacks', () => {
    svc.submitCallback({ name: 'B', email: 'b@a.com', preferred_time: 'Mo' }).subscribe();
    const req = http.expectOne('/api/callbacks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.preferred_time).toBe('Mo');
    req.flush({ ok: true, id: 2 });
  });
});
