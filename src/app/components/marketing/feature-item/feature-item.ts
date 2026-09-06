import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'nf-feature-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-3">
      <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
      <div>
        <p class="font-medium text-text-primary">{{ title() }}</p>
        @if (desc()) { <p class="mt-1 text-sm text-text-secondary">{{ desc() }}</p> }
      </div>
    </div>
  `,
})
export class FeatureItem {
  readonly title = input('');
  readonly desc = input('');
}
