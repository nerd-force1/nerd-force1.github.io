import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { EngagementService } from '../../core/engagement.service';
import { CallbackPayload } from '../../core/engagement.models';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';
import { LocalizePipe } from '../../core/localize.pipe';

@Component({
  selector: 'nf-kontakt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, SectionHeading, LocalizePipe],
  template: `
    <section class="section section-narrow section-top">
      <nf-section-heading
        level="h1"
        [label]="'kontakt.label' | translate"
        [title]="'kontakt.title' | translate"
        [sub]="'kontakt.sub' | translate"
      />

      @if (state() === 'done') {
        <div class="surface-card mt-8 p-8 text-center">
          <p class="status-dot mx-auto"></p>
          <h2 class="mt-4 heading-2">{{ 'form.thanks' | translate }}</h2>
          <p class="mt-2 text-text-secondary">{{ 'form.thanksBody' | translate }}</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-10 space-y-4">
          <!-- Honeypot: hidden from humans, irresistible to bots. -->
          <input
            type="text"
            formControlName="company_website"
            class="hidden"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
          <label class="block">
            <span class="mono-label">{{ 'form.email' | translate }}</span>
            <input formControlName="email" type="email" autocomplete="email" class="field-input mt-1" />
          </label>
          <label class="block">
            <span class="mono-label">{{ 'form.nameOptional' | translate }}</span>
            <input formControlName="name" autocomplete="name" class="field-input mt-1" />
          </label>
          <label class="block">
            <span class="mono-label">{{ 'kontakt.preferredTime' | translate }}</span>
            <input formControlName="preferred_time" class="field-input mt-1" />
          </label>
          <label class="block">
            <span class="mono-label">{{ 'form.messageOptional' | translate }}</span>
            <textarea formControlName="message" rows="4" class="field-input mt-1"></textarea>
          </label>
          @if (state() === 'error') {
            <p class="text-danger">{{ 'form.error' | translate }}</p>
          }
          <button
            type="submit"
            [disabled]="form.invalid || state() === 'sending'"
            class="accent-button px-6 py-3 focus-ring disabled:opacity-50"
          >
            {{ 'kontakt.submit' | translate }}
          </button>
        </form>

        <div class="surface-card mt-10 p-6 text-center">
          <p class="text-text-secondary">{{ 'kontakt.quotePrompt' | translate }}</p>
          <a [routerLink]="'/quote' | loc" class="ghost-button mt-4 inline-block px-6 py-3 focus-ring">
            {{ 'cta.quote' | translate }}
          </a>
        </div>
      }
    </section>
  `,
})
export class KontaktPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EngagementService);
  protected readonly state = signal<'idle' | 'sending' | 'done' | 'error'>('idle');

  // Email is the only required field: every extra field is friction, and a human
  // reads and answers this, so name/preferred_time/message are nice-to-have.
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: [''],
    preferred_time: [''],
    message: [''],
    company_website: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.state.set('sending');
    const payload: CallbackPayload = { ...this.form.getRawValue() };
    this.api.submitCallback(payload).subscribe({
      next: () => this.state.set('done'),
      error: () => this.state.set('error'),
    });
  }
}
