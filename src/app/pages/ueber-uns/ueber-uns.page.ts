import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';
import { ValueProps } from '../../components/marketing/value-props/value-props';
import { CtaBand } from '../../components/marketing/cta-band/cta-band';
import { TeamGrid } from '../../components/marketing/team-grid/team-grid';
import { ORGANIZATION_ID, TEAM } from '../../data/team.data';

const JSONLD_ID = 'nf-team-jsonld';

@Component({
  selector: 'nf-ueber-uns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SectionHeading, ValueProps, CtaBand, TeamGrid],
  template: `
    <section class="section section-narrow section-top">
      <nf-section-heading level="h1" [label]="'about.label' | translate" [title]="'about.title' | translate" />
      <p class="mt-6 text-text-secondary">{{ 'about.body1' | translate }}</p>
      <p class="mt-4 text-text-secondary">{{ 'about.body2' | translate }}</p>
    </section>
    <section class="section" id="team">
      <nf-section-heading [label]="'team.label' | translate" [title]="'team.title' | translate" [sub]="'team.sub' | translate" />
      <div class="mt-10"><nf-team-grid /></div>
    </section>
    <section class="section">
      <nf-value-props />
    </section>
    <nf-cta-band />
  `,
})
export class UeberUnsPage implements OnDestroy {
  private readonly doc = inject(DOCUMENT);

  constructor() {
    // Written in the constructor so the prerenderer serialises it into the static HTML.
    // Replace rather than append: navigating away and back must not stack graphs.
    this.doc.getElementById(JSONLD_ID)?.remove();
    const script = this.doc.createElement('script');
    script.id = JSONLD_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(teamGraph());
    this.doc.head.appendChild(script);
  }

  ngOnDestroy(): void {
    this.doc.getElementById(JSONLD_ID)?.remove();
  }
}

/**
 * Organization + one Person per team member, each under the canonical `@id` that the
 * other AI-Gruppe sites already use for that person (see team.data.ts).
 */
function teamGraph(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'nerd_force1 UG',
        legalName: 'nerd_force1 UG (haftungsbeschränkt)',
        url: 'https://nerd-force1.com/',
        brand: { '@id': 'https://gruppe.ai/#brand' },
        employee: TEAM.map((m) => ({ '@id': m.id })),
        sameAs: ['https://nerd-force1.de/', 'https://www.linkedin.com/company/nerd-force1/'],
      },
      ...TEAM.map((m) => ({
        '@type': 'Person',
        '@id': m.id,
        name: m.name,
        givenName: m.givenName,
        familyName: m.familyName,
        jobTitle: m.managingDirector
          ? [`${m.jobTitle}, nerd_force1 UG`, 'Geschäftsführer, nerd_force1 UG']
          : `${m.jobTitle}, nerd_force1 UG`,
        url: m.url,
        worksFor: { '@id': ORGANIZATION_ID },
        sameAs: m.links.map((l) => l.href),
      })),
    ],
  };
}
