import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizePipe } from '../../../core/localize.pipe';

@Component({
  selector: 'nf-cta-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizePipe],
  template: `
    <section class="section">
      <div class="surface-raised flex flex-col items-center gap-6 px-8 py-14 text-center">
        <h2 class="heading-1">{{ 'cta.title' | translate }}</h2>
        <p class="max-w-xl text-text-secondary">{{ 'cta.sub' | translate }}</p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <a [routerLink]="'/configurator' | loc" class="accent-button px-6 py-3 focus-ring">{{ 'cta.configure' | translate }}</a>
          <a [routerLink]="'/contact' | loc" class="ghost-button px-6 py-3 focus-ring">{{ 'cta.book' | translate }}</a>
        </div>
      </div>
    </section>
  `,
})
export class CtaBand {}
