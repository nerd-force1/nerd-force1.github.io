import { Catalog } from '../core/catalog.models';

export interface Selection {
  slugs: Set<string>;
  environments: number;
  usersBand: string;
  dataBand: string;
  nodesBand: string;
  hosting: string;
  sla: string;
}

export interface EstimateResult { amount: number; hasCustom: boolean; }

const bandFactor = (bands: { id: string; factor: number }[], id: string): number =>
  bands.find(b => b.id === id)?.factor ?? 0;

export function computeEstimate(catalog: Catalog, sel: Selection): EstimateResult {
  const selected = catalog.modules.filter(m => sel.slugs.has(m.slug));
  const base = selected.reduce((sum, m) => sum + (m.base_monthly ?? 0), 0);

  const p = catalog.pricing;
  const scale =
    1 +
    Math.max(0, sel.environments - 1) * p.environment_step +
    bandFactor(p.bands.users, sel.usersBand) +
    bandFactor(p.bands.data, sel.dataBand) +
    bandFactor(p.bands.nodes, sel.nodesBand);

  const slaFactor = p.sla_factors[sel.sla] ?? 1;
  const hostingFactor = p.hosting_factors[sel.hosting] ?? 1;

  return {
    amount: Math.round(base * scale * slaFactor * hostingFactor),
    hasCustom: sel.slugs.has('custom'),
  };
}
