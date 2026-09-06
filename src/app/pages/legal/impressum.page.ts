import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalContent } from './legal-content';

@Component({
  selector: 'nf-impressum',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalContent],
  template: `<nf-legal-content key="impressum" />`,
})
export class ImpressumPage {}
