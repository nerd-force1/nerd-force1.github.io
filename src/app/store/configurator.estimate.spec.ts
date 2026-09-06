import { computeEstimate, Selection } from './configurator.estimate';
import { Catalog } from '../core/catalog.models';

const catalog: Catalog = {
  version: 1, currency: 'EUR', disclaimer: '',
  modules: [
    { slug: 'core-platform', name: 'Core', base_monthly: 1500, sub_services: [] },
    { slug: 'gitops-k8s', name: 'K8s', base_monthly: 3500, sub_services: [] },
    { slug: 'custom', name: 'Custom', base_monthly: null, sub_services: [] },
  ],
  pricing: {
    environment_step: 0.15,
    sla_factors: { standard: 1.0, business: 1.25 },
    hosting_factors: { hetzner: 1.0, onprem: 1.1 },
    bands: {
      users: [{ id: '1-25', label: '', factor: 0 }, { id: '500+', label: '', factor: 0.6 }],
      data:  [{ id: '<1tb', label: '', factor: 0 }, { id: '100tb+', label: '', factor: 0.5 }],
      nodes: [{ id: '1-3', label: '', factor: 0 }, { id: '30+', label: '', factor: 0.6 }],
    },
  },
};

const baseSel: Selection = {
  slugs: new Set<string>(), environments: 1,
  usersBand: '1-25', dataBand: '<1tb', nodesBand: '1-3', hosting: 'hetzner', sla: 'standard',
};

describe('computeEstimate', () => {
  it('is 0 with nothing selected', () => {
    expect(computeEstimate(catalog, baseSel).amount).toBe(0);
  });
  it('sums bases at scale 1 / standard / hetzner', () => {
    const sel = { ...baseSel, slugs: new Set(['core-platform', 'gitops-k8s']) };
    expect(computeEstimate(catalog, sel).amount).toBe(5000); // 1500+3500
  });
  it('applies environments beyond the first', () => {
    const sel = { ...baseSel, slugs: new Set(['core-platform']), environments: 3 }; // 1 + 2*0.15 = 1.3
    expect(computeEstimate(catalog, sel).amount).toBe(1950); // 1500*1.3
  });
  it('applies sla and hosting factors', () => {
    const sel = { ...baseSel, slugs: new Set(['core-platform']), sla: 'business', hosting: 'onprem' };
    expect(computeEstimate(catalog, sel).amount).toBe(2063); // round(1500*1*1.25*1.1) = round(2062.5)
  });
  it('stacks band factors into the scale factor', () => {
    const sel = { ...baseSel, slugs: new Set(['core-platform']), usersBand: '500+', dataBand: '100tb+', nodesBand: '30+' };
    // scale = 1 + 0.6 + 0.5 + 0.6 = 2.7 -> 1500*2.7 = 4050
    expect(computeEstimate(catalog, sel).amount).toBe(4050);
  });
  it('custom contributes 0 but sets hasCustom', () => {
    const sel = { ...baseSel, slugs: new Set(['custom']) };
    const r = computeEstimate(catalog, sel);
    expect(r.amount).toBe(0);
    expect(r.hasCustom).toBe(true);
  });
});
