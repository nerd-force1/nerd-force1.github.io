import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ConsentStore } from '../../../store/consent.store';

@Component({
  selector: 'nf-cookie-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './cookie-banner.html',
})
export class CookieBanner {
  protected readonly consent = inject(ConsentStore);
}
