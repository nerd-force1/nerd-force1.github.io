import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfiguratorStore } from '../../../store/configurator.store';

@Component({
  selector: 'nf-config-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, TranslatePipe],
  template: `
    @if (store.catalog(); as cat) {
      <div class="surface-card p-5">
        <p class="mono-label">{{ 'angebot.yourConfig' | translate }}</p>
        @if (store.selectedCount()) {
          <ul class="mt-3 space-y-1">
            @for (m of cat.modules; track m.slug) {
              @if (store.selection().slugs.has(m.slug)) {
                <li class="text-sm text-text-secondary">· {{ m.name }}</li>
              }
            }
          </ul>
          <p class="mt-3 font-mono text-accent">
            {{ 'konfigurator.from' | translate }}
            {{ store.estimate().amount | currency: cat.currency : 'symbol' : '1.0-0' }}/mo
          </p>
        } @else {
          <p class="mt-2 text-sm text-text-secondary">{{ 'angebot.noConfig' | translate }}</p>
        }
      </div>
    }
  `,
})
export class ConfigSummary {
  protected readonly store = inject(ConfiguratorStore);
}
