import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../icon/icon';
import { Pillar, PillarSlug } from '../../../data/pillars.data';
import { LocalizePipe } from '../../../core/localize.pipe';

/**
 * Per-pillar hue classes, written out as LITERAL strings.
 *
 * Not `text-pillar-${slug}`: Tailwind v4 finds class names by scanning source text, so a
 * template literal compiles fine and silently emits no CSS. The build stays green and the
 * colour is simply absent. Every name here must appear verbatim.
 */
const HUES: Record<PillarSlug, { hueText: string; hueBg: string; hueBorder: string }> = {
  'core-platform': {
    hueText: 'text-pillar-core-platform',
    hueBg: 'bg-pillar-core-platform/10',
    hueBorder: 'hover:border-pillar-core-platform',
  },
  'gitops-k8s': {
    hueText: 'text-pillar-gitops-k8s',
    hueBg: 'bg-pillar-gitops-k8s/10',
    hueBorder: 'hover:border-pillar-gitops-k8s',
  },
  'security-ops': {
    hueText: 'text-pillar-security-ops',
    hueBg: 'bg-pillar-security-ops/10',
    hueBorder: 'hover:border-pillar-security-ops',
  },
  'collab-apps': {
    hueText: 'text-pillar-collab-apps',
    hueBg: 'bg-pillar-collab-apps/10',
    hueBorder: 'hover:border-pillar-collab-apps',
  },
  'custom': {
    hueText: 'text-pillar-custom',
    hueBg: 'bg-pillar-custom/10',
    hueBorder: 'hover:border-pillar-custom',
  },
};

@Component({
  selector: 'nf-pillar-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, Icon, LocalizePipe],
  template: `
    <a [routerLink]="['/services' | loc, pillar().slug]"
       [class]="hue().hueBorder"
       class="surface-raised group block p-6 focus-ring">
      <span class="inline-flex rounded-card p-3" [class]="[hue().hueBg, hue().hueText]">
        <nf-icon [name]="pillar().icon" />
      </span>
      <h3 class="mt-4 heading-3">{{ pillar().titleKey | translate }}</h3>
      <p class="mt-2 text-sm text-text-secondary">{{ pillar().oneLinerKey | translate }}</p>
      <span class="mono-label mt-4 inline-block group-hover:underline" [class]="hue().hueText">
        {{ 'cta.learnMore' | translate }} <span aria-hidden="true">→</span>
      </span>
    </a>
  `,
})
export class PillarCard {
  readonly pillar = input.required<Pillar>();
  protected readonly hue = computed(() => HUES[this.pillar().slug]);
}
