import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PILLARS } from '../../data/pillars.data';
import { PillarCard } from '../../components/marketing/pillar-card/pillar-card';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';
import { CtaBand } from '../../components/marketing/cta-band/cta-band';

@Component({
  selector: 'nf-leistungen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PillarCard, SectionHeading, CtaBand],
  template: `
    <section class="section section-top">
      <nf-section-heading level="h1" [label]="'leistungen.label' | translate" [title]="'leistungen.title' | translate" [sub]="'leistungen.sub' | translate" />
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (p of pillars; track p.slug) { <nf-pillar-card [pillar]="p" /> }
      </div>
    </section>
    <nf-cta-band />
  `,
})
export class LeistungenPage { protected readonly pillars = PILLARS; }
