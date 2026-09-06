import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nf-tech-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="surface-card px-3 py-1.5 font-mono text-sm text-text-secondary">{{ name() }}</span>`,
})
export class TechBadge {
  readonly name = input.required<string>();
}
