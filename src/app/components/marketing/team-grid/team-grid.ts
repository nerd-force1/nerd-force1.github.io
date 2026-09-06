import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TEAM } from '../../../data/team.data';

@Component({
  selector: 'nf-team-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
      @for (m of team; track m.key) {
        <li class="surface-card flex flex-col gap-4 p-6" [id]="m.key">
          <span class="mono-label" aria-hidden="true">{{ initials(m.givenName, m.familyName) }}</span>
          <div>
            <h3 class="heading-4">{{ m.name }}</h3>
            <p class="mt-1 text-sm text-accent">
              {{ 'team.members.' + m.key + '.role' | translate }}
              @if (m.managingDirector) { · {{ 'team.managingDirector' | translate }} }
            </p>
            <p class="mt-3 text-sm text-text-secondary">{{ 'team.members.' + m.key + '.blurb' | translate }}</p>
          </div>
          <ul class="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm" [attr.aria-label]="m.name">
            @for (l of m.links; track l.href) {
              <li><a class="text-text-secondary hover:text-text-primary focus-ring" [href]="l.href" rel="me noopener" target="_blank">{{ l.label }}</a></li>
            }
          </ul>
        </li>
      }
    </ul>
  `,
})
export class TeamGrid {
  readonly team = TEAM;

  initials(given: string, family: string): string {
    return `${given[0]}${family[0]}`.toUpperCase();
  }
}
