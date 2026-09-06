import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nf-stat-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="surface-raised p-6">
      <p class="font-heading text-3xl font-bold text-accent">{{ value() }}</p>
      <p class="mt-1 text-sm text-text-secondary">{{ label() }}</p>
    </div>
  `,
})
export class StatTile {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
}
