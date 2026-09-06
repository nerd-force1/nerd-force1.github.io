import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfiguratorStore } from '../../store/configurator.store';
import { EngagementService } from '../../core/engagement.service';
import { QuotePayload } from '../../core/engagement.models';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';
import { ConfigSummary } from './components/config-summary';

@Component({
  selector: 'nf-angebot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, SectionHeading, ConfigSummary],
  template: `
    <section class="section section-narrow section-top">
      <nf-section-heading
        level="h1"
        [label]="'angebot.label' | translate"
        [title]="'angebot.title' | translate"
        [sub]="'angebot.sub' | translate"
      />
      <nf-config-summary class="mt-8 block" />

      @if (state() === 'done') {
        <div class="surface-card mt-8 p-8 text-center">
          <p class="status-dot mx-auto"></p>
          <h2 class="mt-4 heading-2">
            {{ 'form.thanks' | translate }}
          </h2>
          <p class="mt-2 text-text-secondary">{{ 'form.thanksBody' | translate }}</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 space-y-4">
          <input
            type="text"
            formControlName="company_website"
            class="hidden"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="mono-label">{{ 'form.company' | translate }}</span>
              <input
                formControlName="company"
                class="field-input mt-1"
              />
            </label>
            <label class="block">
              <span class="mono-label">{{ 'form.name' | translate }}</span>
              <input
                formControlName="contact_name"
                class="field-input mt-1"
              />
            </label>
            <label class="block">
              <span class="mono-label">{{ 'form.email' | translate }}</span>
              <input
                formControlName="email"
                type="email"
                class="field-input mt-1"
              />
            </label>
            <label class="block">
              <span class="mono-label">{{ 'form.phone' | translate }}</span>
              <input
                formControlName="phone"
                class="field-input mt-1"
              />
            </label>
          </div>
          <label class="block">
            <span class="mono-label">{{ 'form.message' | translate }}</span>
            <textarea
              formControlName="message"
              rows="4"
              class="field-input mt-1"
            ></textarea>
          </label>
          @if (state() === 'error') {
            <p class="text-danger">{{ 'form.error' | translate }}</p>
          }
          <button
            type="submit"
            [disabled]="form.invalid || state() === 'sending'"
            class="accent-button px-6 py-3 focus-ring disabled:opacity-50"
          >
            {{ 'form.submitQuote' | translate }}
          </button>
        </form>
      }
    </section>
  `,
})
export class AngebotPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(ConfiguratorStore);
  private readonly api = inject(EngagementService);
  protected readonly state = signal<'idle' | 'sending' | 'done' | 'error'>('idle');
  protected readonly form = this.fb.nonNullable.group({
    company: ['', Validators.required],
    contact_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: [''],
    company_website: [''],
  });

  ngOnInit(): void {
    if (!this.store.catalog()) this.store.load();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.state.set('sending');
    const sel = this.store.selection();
    const payload: QuotePayload = {
      ...this.form.getRawValue(),
      selected_config: {
        modules: [...sel.slugs],
        environments: sel.environments,
        users_band: sel.usersBand,
        data_band: sel.dataBand,
        nodes_band: sel.nodesBand,
        hosting: sel.hosting,
        sla: sel.sla,
      },
      estimate_amount: this.store.estimate().amount,
    };
    this.api.submitQuote(payload).subscribe({
      next: () => this.state.set('done'),
      error: () => this.state.set('error'),
    });
  }
}
