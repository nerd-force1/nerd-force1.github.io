import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ack, CallbackPayload, QuotePayload } from './engagement.models';

@Injectable({ providedIn: 'root' })
export class EngagementService {
  private readonly http = inject(HttpClient);

  submitQuote(p: QuotePayload): Observable<Ack> {
    return this.http.post<Ack>('/api/quotes', p);
  }

  submitCallback(p: CallbackPayload): Observable<Ack> {
    return this.http.post<Ack>('/api/callbacks', p);
  }
}
