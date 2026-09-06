import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const PATHS = {
  shield: 'M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z',
  cloud:  'M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.4A3.5 3.5 0 0 1 18 18H7Z',
  server: 'M3 4h18v6H3V4Zm0 10h18v6H3v-6ZM7 7h.01M7 17h.01',
  lock:   'M6 10V7a6 6 0 0 1 12 0v3m-9 0h6a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z',
  layers: 'm12 2 9 5-9 5-9-5 9-5Zm9 10-9 5-9-5m18 5-9 5-9-5',
  wrench: 'M14 7a4 4 0 0 1-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-3-3 3-3Z',
} as const;

export type IconName = keyof typeof PATHS;

@Component({
  selector: 'nf-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
         stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" aria-hidden="true">
      <path [attr.d]="path()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly path = () => PATHS[this.name()];
}
