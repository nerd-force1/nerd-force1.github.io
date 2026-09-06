import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { pillarBySlug } from '../../data/pillars.data';
import { Icon } from '../../components/marketing/icon/icon';
import { FeatureItem } from '../../components/marketing/feature-item/feature-item';
import { CtaBand } from '../../components/marketing/cta-band/cta-band';
import { LocalizePipe } from '../../core/localize.pipe';

@Component({
  selector: 'nf-leistungen-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, Icon, FeatureItem, CtaBand, LocalizePipe],
  template: `
    @if (pillar(); as p) {
      <section class="section section-top">
        <a [routerLink]="'/services' | loc" class="mono-label hover:text-accent focus-ring"><span aria-hidden="true">←</span> {{ 'leistungen.back' | translate }}</a>
        <span class="mt-6 inline-flex rounded-card bg-accent-soft p-3 text-accent"><nf-icon [name]="p.icon" /></span>
        <h1 class="mt-4 heading-1">{{ p.titleKey | translate }}</h1>
        <p class="mt-4 max-w-2xl text-lg text-text-secondary">{{ p.oneLinerKey | translate }}</p>
        <div class="mt-10">
          <p class="mono-label">{{ 'leistungen.includes' | translate }}</p>
          <div class="mt-6 grid gap-5 sm:grid-cols-2">
            @for (k of p.capabilityKeys; track k) { <nf-feature-item [title]="k | translate" /> }
          </div>
        </div>
      </section>
      <nf-cta-band />
    } @else {
      <section class="section text-center">
        <h1 class="heading-1">{{ 'leistungen.notFound' | translate }}</h1>
        <a [routerLink]="'/services' | loc" class="accent-button mt-6 inline-block px-6 py-3 focus-ring">{{ 'leistungen.back' | translate }}</a>
      </section>
    }
  `,
})
export class LeistungenDetailPage {
  readonly pillarParam = input<string>('', { alias: 'pillar' });
  protected readonly pillar = computed(() => pillarBySlug(this.pillarParam()));
}
