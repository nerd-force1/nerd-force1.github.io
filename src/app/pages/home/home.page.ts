import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StatTile } from '../../components/marketing/stat-tile/stat-tile';
import { CtaBand } from '../../components/marketing/cta-band/cta-band';
import { ValueProps } from '../../components/marketing/value-props/value-props';
import { Aw40Note } from '../../components/marketing/aw40-note/aw40-note';
import { LocalizePipe } from '../../core/localize.pipe';
import { PillarFan } from '../../components/journey/pillar-fan/pillar-fan';
import { UiStore } from '../../store/ui.store';

@Component({
  selector: 'nf-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, StatTile, CtaBand, ValueProps, Aw40Note, LocalizePipe, PillarFan],
  template: `
    <!-- Hero -->
    <section class="section section-top grid items-center gap-12 lg:grid-cols-2">
      <div>
        <p class="mono-label flex items-center gap-2"><span class="status-dot"></span>{{ 'home.badge' | translate }}</p>
        <h1 class="mt-5 heading-hero">
          {{ 'home.hero.title' | translate }} <span class="gradient-text">{{ 'home.hero.accent' | translate }}</span>
        </h1>
        <p class="mt-6 max-w-2xl text-lg text-text-secondary">{{ 'home.hero.sub' | translate }}</p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <a [routerLink]="'/contact' | loc" class="accent-button px-6 py-3 focus-ring">{{ 'cta.book' | translate }}</a>
          <a [routerLink]="'/services' | loc" class="ghost-button px-6 py-3 focus-ring">{{ 'home.hero.services' | translate }}</a>
        </div>
      </div>
      <!-- Deliberately empty: the live rack (nf-journey-bg, fixed behind the page) holds
           its hero pose in this half at scroll zero and travels to the pillar section as
           you scroll. The spacer keeps the hero's height and reserves the visual slot;
           below lg the rack is not part of the hero (see pillar-fan), so nothing is lost. -->
      <div aria-hidden="true" class="hidden lg:block lg:h-96"></div>
    </section>

    <!-- Value props -->
    <section class="section reveal">
      <nf-value-props />
    </section>

    <!-- Pillars -->
    <nf-pillar-fan />

    <!-- Stats -->
    <section class="section reveal">
      <div class="grid gap-6 sm:grid-cols-3">
        <nf-stat-tile [value]="'home.stats.a.value' | translate" [label]="'home.stats.a.label' | translate" />
        <nf-stat-tile [value]="'home.stats.b.value' | translate" [label]="'home.stats.b.label' | translate" />
        <nf-stat-tile [value]="'home.stats.c.value' | translate" [label]="'home.stats.c.label' | translate" />
      </div>
    </section>

    <!-- Proof -->
    <section class="section reveal">
      <nf-aw40-note />
    </section>

    <nf-cta-band />
  `,
})
export class HomePage {
  private readonly ui = inject(UiStore);

  constructor() {
    this.ui.setBackgroundMode('journey');
    inject(DestroyRef).onDestroy(() => this.ui.setBackgroundMode('topology'));
  }
}
