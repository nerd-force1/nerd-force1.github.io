import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FeatureItem } from '../feature-item/feature-item';

@Component({
  selector: 'nf-value-props',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, FeatureItem],
  template: `
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <nf-feature-item [title]="'values.sovereign.title' | translate" [desc]="'values.sovereign.desc' | translate" />
      <nf-feature-item [title]="'values.code.title' | translate" [desc]="'values.code.desc' | translate" />
      <nf-feature-item [title]="'values.security.title' | translate" [desc]="'values.security.desc' | translate" />
      <nf-feature-item [title]="'values.managed.title' | translate" [desc]="'values.managed.desc' | translate" />
    </div>
  `,
})
export class ValueProps {}
