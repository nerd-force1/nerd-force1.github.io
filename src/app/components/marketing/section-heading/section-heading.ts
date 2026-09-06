import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nf-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl">
      <p class="mono-label">{{ label() }}</p>
      @if (level() === 'h1') {
        <h1 class="mt-3 heading-1">{{ title() }}</h1>
      } @else {
        <h2 class="mt-3 heading-1">{{ title() }}</h2>
      }
      @if (sub()) { <p class="mt-4 text-text-secondary">{{ sub() }}</p> }
    </div>
  `,
})
export class SectionHeading {
  readonly label = input('');
  readonly title = input.required<string>();
  readonly sub = input('');
  readonly level = input<'h1' | 'h2'>('h2');
}
