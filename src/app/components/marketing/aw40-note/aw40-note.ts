import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The aw4.0 research reference — our only third-party proof point.
 *
 * LEGAL: nerd_force1 is NOT one of the aw4.0 consortium's listed partners.
 * Participation was via THGA Bochum. The listed partners are Auto Intern, Eco,
 * DEKRA, DFKI, Hochschule Osnabrück, LMIS, PROLAB, THGA and Vergölst. Never
 * describe us as a partner of the project, and never present those companies as
 * our partners — they are members of the project we contributed to.
 */
@Component({
  selector: 'nf-aw40-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="surface-card p-8">
      <p class="mono-label">{{ 'aw40.label' | translate }}</p>
      <h2 class="mt-3 heading-2">{{ 'aw40.title' | translate }}</h2>
      <p class="mt-4 text-text-secondary">{{ 'aw40.body' | translate }}</p>
      <p class="mt-4 text-sm text-text-muted">{{ 'aw40.context' | translate }}</p>
    </div>
  `,
})
export class Aw40Note {}
