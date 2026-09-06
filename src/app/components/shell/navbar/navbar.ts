import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UiStore } from '../../../store/ui.store';
import { LocalizePipe } from '../../../core/localize.pipe';
import { LangSwitcher } from '../lang-switcher/lang-switcher';

@Component({
  selector: 'nf-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LocalizePipe, LangSwitcher],
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly ui = inject(UiStore);
  protected readonly links = [
    { path: '/services', key: 'nav.services' },
    { path: '/platform', key: 'nav.platform' },
    { path: '/configurator', key: 'nav.configurator' },
    { path: '/about', key: 'nav.about' },
  ];
}
