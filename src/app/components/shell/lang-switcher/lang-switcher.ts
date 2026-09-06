import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { DEFAULT_LOCALE, Locale, LOCALES, localeOfPath, swapLocale } from '../../../core/locales';

/**
 * DE/EN switch. Links to the SAME page in the other locale — a switcher that dumps
 * you on the home page is one people use exactly once. That is a plain prefix swap
 * because the slugs are identical in both locales (#58).
 *
 * The active locale is read straight off the current URL (not LocaleService) so the
 * switcher is a pure function of `currentUrl`, which is what makes it trivial to
 * exercise in tests without faking a full router navigation. `currentUrl` is seeded
 * from the router at construction and kept current by subscribing to NavigationEnd.
 *
 * The URL is the state, so there is no localStorage and nothing to consent to.
 */
@Component({
  selector: 'nf-lang-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  template: `
    <a
      [routerLink]="href()"
      class="mono-label hover:text-text-primary focus-ring"
      [attr.hreflang]="target()"
      [attr.aria-label]="'nav.lang.' + target() | translate"
    >{{ 'nav.lang.' + target() | translate }}</a>
  `,
})
export class LangSwitcher {
  private readonly router = inject(Router);

  // Seeded from the router's current URL so the first render (SSR included) is right,
  // then kept current by subscribing to NavigationEnd.
  protected readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));
  }

  private readonly path = computed(() => this.currentUrl().split('?')[0].split('#')[0]);

  // Public: exercised directly by lang-switcher.spec.ts.
  readonly target = computed<Locale>(() => {
    const current = localeOfPath(this.path()) ?? DEFAULT_LOCALE;
    return LOCALES.find((l) => l !== current) ?? 'en';
  });

  readonly href = computed(() => swapLocale(this.path(), this.target()));
}
