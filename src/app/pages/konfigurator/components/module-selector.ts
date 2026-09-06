import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { ConfiguratorStore } from '../../../store/configurator.store';

@Component({
  selector: 'nf-module-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CurrencyPipe],
  template: `
    @if (store.catalog(); as cat) {
      <div class="grid gap-4 sm:grid-cols-2">
        @for (m of cat.modules; track m.slug) {
          <button type="button" (click)="store.toggleModule(m.slug)"
            class="surface-card p-5 text-left transition-colors focus-ring"
            [attr.aria-pressed]="store.selection().slugs.has(m.slug)"
            [class.border-accent]="store.selection().slugs.has(m.slug)">
            <div class="flex items-center justify-between">
              <h3 class="heading-4">{{ m.name }}</h3>
              <span class="h-5 w-5 rounded-full border border-hairline"
                    [class.bg-accent]="store.selection().slugs.has(m.slug)"></span>
            </div>
            <p class="mt-2 font-mono text-sm text-accent">
              @if (m.base_monthly !== null) { {{ 'konfigurator.from' | translate }} {{ m.base_monthly | currency:cat.currency:'symbol':'1.0-0' }}/mo }
              @else { {{ 'konfigurator.letsTalk' | translate }} }
            </p>
            @if (m.sub_services.length) {
              <ul class="mt-3 space-y-1">
                @for (s of m.sub_services; track s.key) {
                  <li class="text-xs text-text-secondary">· {{ s.name }}</li>
                }
              </ul>
            }
          </button>
        }
      </div>
    }
  `,
})
export class ModuleSelector {
  protected readonly store = inject(ConfiguratorStore);
}
