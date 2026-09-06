import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizePipe } from '../../core/localize.pipe';
@Component({
  selector: 'nf-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink, LocalizePipe],
  template: `
    <section class="section">
      <p class="mono-label">404</p>
      <h1 class="mt-3 heading-1">{{ 'errors.notFound.title' | translate }}</h1>
      <p class="mt-4 text-text-secondary">{{ 'errors.notFound.body' | translate }}</p>
      <a [routerLink]="'/' | loc" class="accent-button mt-8 inline-block px-4 py-2 focus-ring">{{ 'errors.notFound.cta' | translate }}</a>
    </section>
  `,
})
export class NotFoundPage {}
