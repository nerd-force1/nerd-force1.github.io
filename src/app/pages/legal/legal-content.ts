import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

interface LegalSection {
  title: string;
  body: string;
}

@Component({
  selector: 'nf-legal-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section-narrow section-top">
      <p class="mono-label">{{ label() }}</p>
      <h1 class="mt-3 heading-1">{{ heading() }}</h1>
      @if (updated()) {
        <p class="mt-2 text-sm text-text-muted">{{ updated() }}</p>
      }
      <div class="mt-10 space-y-8">
        @for (s of sections(); track s.title) {
          <div>
            <h2 class="heading-3">{{ s.title }}</h2>
            <p class="mt-2 whitespace-pre-line text-text-secondary">{{ s.body }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class LegalContent {
  private readonly translate = inject(TranslateService);

  /** i18n root key, e.g. 'impressum' or 'datenschutz'. */
  readonly key = input.required<string>();

  // Recompute whenever the active language changes (OnPush-correct).
  private readonly lang = toSignal(this.translate.onLangChange, { initialValue: null });

  protected readonly label = computed(() => (this.lang(), this.translate.instant(`${this.key()}.label`)));
  protected readonly heading = computed(() => (this.lang(), this.translate.instant(`${this.key()}.title`)));
  protected readonly updated = computed(() => (this.lang(), this.translate.instant(`${this.key()}.updated`)));
  protected readonly sections = computed<LegalSection[]>(() => {
    this.lang();
    const v = this.translate.instant(`${this.key()}.sections`);
    return Array.isArray(v) ? v : [];
  });
}
