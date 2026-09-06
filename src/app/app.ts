import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SeoService } from './core/seo.service';
import { Navbar } from './components/shell/navbar/navbar';
import { Footer } from './components/shell/footer/footer';
import { CookieBanner } from './components/shell/cookie-banner/cookie-banner';
import { TopologyBg } from './components/shell/topology-bg/topology-bg';
import { JourneyBg } from './components/journey/journey-bg/journey-bg';
import { UiStore } from './store/ui.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, CookieBanner, TopologyBg, JourneyBg],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  protected readonly ui = inject(UiStore);

  constructor() {
    // First render (SSR included) plus every navigation. Server-side this is what
    // puts hreflang and canonical in the HTML Googlebot actually reads.
    this.seo.update(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.seo.update(e.urlAfterRedirects));
  }
}
