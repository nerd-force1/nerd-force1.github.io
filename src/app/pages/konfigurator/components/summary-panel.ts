import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfiguratorStore } from '../../../store/configurator.store';
import { LocalizePipe } from '../../../core/localize.pipe';

@Component({
  selector: 'nf-summary-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, TranslatePipe, LocalizePipe],
  template: `
    <aside class="surface-card sticky top-24 p-6">
      <p class="mono-label">{{ 'konfigurator.estimate' | translate }}</p>
      @if (store.catalog(); as cat) {
        <p class="mt-2 font-mono text-3xl font-bold text-text-primary">
          {{ 'konfigurator.from' | translate }} <span class="text-accent">{{ store.estimate().amount | currency:cat.currency:'symbol':'1.0-0' }}</span>
          <span class="text-base text-text-secondary">/mo</span>
        </p>
        @if (store.estimate().hasCustom) { <p class="mt-1 text-sm text-text-secondary">{{ 'konfigurator.plusCustom' | translate }}</p> }
        <p class="mt-3 text-xs text-text-muted">{{ cat.disclaimer }}</p>
        <div class="mt-6 flex flex-col gap-3">
          @if (store.selectedCount()) {
            <a [routerLink]="'/quote' | loc" class="accent-button px-5 py-3 text-center focus-ring">{{ 'cta.quote' | translate }}</a>
          } @else {
            <span class="accent-button px-5 py-3 text-center opacity-50" aria-disabled="true">{{ 'cta.quote' | translate }}</span>
          }
          <a [routerLink]="'/contact' | loc" class="ghost-button px-5 py-3 text-center focus-ring">{{ 'cta.book' | translate }}</a>
        </div>
        <button type="button" (click)="store.reset()" class="mono-label mt-4 text-text-muted hover:text-accent focus-ring">{{ 'konfigurator.reset' | translate }}</button>
      } @else if (store.loading()) {
        <p class="mt-4 text-text-secondary">{{ 'konfigurator.loading' | translate }}</p>
      } @else {
        <p class="mt-4 text-danger">{{ 'konfigurator.error' | translate }}</p>
      }
    </aside>
  `,
})
export class SummaryPanel {
  protected readonly store = inject(ConfiguratorStore);
}
