import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PLATFORM_GROUPS } from '../../data/platform.data';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';
import { TechBadge } from '../../components/marketing/tech-badge/tech-badge';
import { CtaBand } from '../../components/marketing/cta-band/cta-band';

@Component({
  selector: 'nf-plattform',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SectionHeading, TechBadge, CtaBand],
  template: `
    <section class="section section-top">
      <nf-section-heading level="h1" [label]="'plattform.label' | translate" [title]="'plattform.title' | translate" [sub]="'plattform.sub' | translate" />
      <div class="mt-10 grid gap-8 sm:grid-cols-2">
        @for (g of groups; track g.titleKey) {
          <div class="surface-card p-6">
            <h3 class="heading-4">{{ g.titleKey | translate }}</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              @for (t of g.tech; track t) { <nf-tech-badge [name]="t" /> }
            </div>
          </div>
        }
      </div>
    </section>
    <nf-cta-band />
  `,
})
export class PlattformPage { protected readonly groups = PLATFORM_GROUPS; }
