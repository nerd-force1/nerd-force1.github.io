import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfiguratorStore } from '../../store/configurator.store';
import { ModuleSelector } from './components/module-selector';
import { ScaleControls } from './components/scale-controls';
import { SummaryPanel } from './components/summary-panel';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';

@Component({
  selector: 'nf-konfigurator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ModuleSelector, ScaleControls, SummaryPanel, SectionHeading],
  template: `
    <section class="section section-top">
      <nf-section-heading level="h1" [label]="'konfigurator.label' | translate" [title]="'konfigurator.title' | translate" [sub]="'konfigurator.sub' | translate" />
      <div class="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div class="space-y-10">
          <div>
            <p class="mono-label">{{ 'konfigurator.step1' | translate }}</p>
            <nf-module-selector class="mt-4 block" />
          </div>
          <div>
            <p class="mono-label">{{ 'konfigurator.step2' | translate }}</p>
            <nf-scale-controls class="mt-4 block" />
          </div>
        </div>
        <nf-summary-panel />
      </div>
    </section>
  `,
})
export class KonfiguratorPage implements OnInit {
  private readonly store = inject(ConfiguratorStore);
  ngOnInit(): void {
    if (!this.store.catalog()) this.store.load();
  }
}
