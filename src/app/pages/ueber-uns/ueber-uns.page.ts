import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionHeading } from '../../components/marketing/section-heading/section-heading';
import { ValueProps } from '../../components/marketing/value-props/value-props';
import { CtaBand } from '../../components/marketing/cta-band/cta-band';

@Component({
  selector: 'nf-ueber-uns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SectionHeading, ValueProps, CtaBand],
  template: `
    <section class="section section-narrow section-top">
      <nf-section-heading level="h1" [label]="'about.label' | translate" [title]="'about.title' | translate" />
      <p class="mt-6 text-text-secondary">{{ 'about.body1' | translate }}</p>
      <p class="mt-4 text-text-secondary">{{ 'about.body2' | translate }}</p>
    </section>
    <section class="section">
      <nf-value-props />
    </section>
    <nf-cta-band />
  `,
})
export class UeberUnsPage {}
