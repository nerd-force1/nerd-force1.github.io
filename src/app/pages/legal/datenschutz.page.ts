import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalContent } from './legal-content';

@Component({
  selector: 'nf-datenschutz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalContent],
  template: `<nf-legal-content key="datenschutz" />`,
})
export class DatenschutzPage {}
