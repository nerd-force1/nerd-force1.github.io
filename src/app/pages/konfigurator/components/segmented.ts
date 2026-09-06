import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface SegOption { id: string; label?: string; labelKey?: string; }

@Component({
  selector: 'nf-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="inline-flex flex-wrap gap-1 rounded-card border border-hairline p-1">
      @for (opt of options(); track opt.id) {
        <button type="button" (click)="pick.emit(opt.id)"
          class="rounded-card px-3 py-1.5 text-sm focus-ring"
          [attr.aria-pressed]="opt.id === value()"
          [class.bg-accent]="opt.id === value()"
          [class.text-bg-void]="opt.id === value()"
          [class.text-text-secondary]="opt.id !== value()">
          {{ opt.labelKey ? (opt.labelKey | translate) : opt.label }}
        </button>
      }
    </div>
  `,
})
export class Segmented {
  readonly options = input.required<SegOption[]>();
  readonly value = input.required<string>();
  readonly pick = output<string>();
}
