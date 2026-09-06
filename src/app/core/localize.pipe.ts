import { inject, Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from './locale.service';

/**
 * Prefixes an internal path with the active locale: `'/contact' | loc` -> `/de/contact`.
 *
 * IMPURE deliberately: a pure pipe caches on its input, so it would never
 * re-evaluate when only the locale changed and every link would keep pointing at
 * the previous locale after a switch. ngx-translate's TranslatePipe is impure for
 * the same reason; with OnPush everywhere the cost is bounded.
 */
@Pipe({ name: 'loc', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly locale = inject(LocaleService);

  transform(path: string): string {
    return this.locale.localize(path);
  }
}
