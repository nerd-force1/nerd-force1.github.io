import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfiguratorStore } from '../../../store/configurator.store';
import { Catalog } from '../../../core/catalog.models';
import { Segmented } from './segmented';

@Component({
  selector: 'nf-scale-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, Segmented],
  template: `
    @if (store.catalog(); as cat) {
      <div class="space-y-5">
        <div>
          <p class="mono-label">{{ 'konfigurator.scale.environments' | translate }}</p>
          <div class="mt-2 flex items-center gap-3">
            <button type="button" class="ghost-button h-8 w-8 focus-ring" (click)="stepEnv(-1)">−</button>
            <span class="w-8 text-center font-mono">{{ store.selection().environments }}</span>
            <button type="button" class="ghost-button h-8 w-8 focus-ring" (click)="stepEnv(1)">+</button>
          </div>
        </div>
        <div>
          <p class="mono-label">{{ 'konfigurator.scale.users' | translate }}</p>
          <nf-segmented class="mt-2 block" [options]="cat.pricing.bands.users" [value]="store.selection().usersBand" (pick)="store.setScale({ usersBand: $event })" />
        </div>
        <div>
          <p class="mono-label">{{ 'konfigurator.scale.data' | translate }}</p>
          <nf-segmented class="mt-2 block" [options]="cat.pricing.bands.data" [value]="store.selection().dataBand" (pick)="store.setScale({ dataBand: $event })" />
        </div>
        <div>
          <p class="mono-label">{{ 'konfigurator.scale.nodes' | translate }}</p>
          <nf-segmented class="mt-2 block" [options]="cat.pricing.bands.nodes" [value]="store.selection().nodesBand" (pick)="store.setScale({ nodesBand: $event })" />
        </div>
        <div>
          <p class="mono-label">{{ 'konfigurator.scale.hosting' | translate }}</p>
          <nf-segmented class="mt-2 block" [options]="hostingOptions(cat)" [value]="store.selection().hosting" (pick)="store.setScale({ hosting: $event })" />
        </div>
        <div>
          <p class="mono-label">{{ 'konfigurator.scale.sla' | translate }}</p>
          <nf-segmented class="mt-2 block" [options]="slaOptions(cat)" [value]="store.selection().sla" (pick)="store.setScale({ sla: $event })" />
        </div>
      </div>
    }
  `,
})
export class ScaleControls {
  protected readonly store = inject(ConfiguratorStore);
  protected stepEnv(d: number) {
    const n = Math.min(9, Math.max(1, this.store.selection().environments + d));
    this.store.setScale({ environments: n });
  }
  protected hostingOptions(cat: Catalog) {
    return Object.keys(cat.pricing.hosting_factors).map(id => ({ id, labelKey: 'konfigurator.hosting.' + id }));
  }
  protected slaOptions(cat: Catalog) {
    return Object.keys(cat.pricing.sla_factors).map(id => ({ id, labelKey: 'konfigurator.sla.' + id }));
  }
}
