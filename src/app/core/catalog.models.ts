export interface SubService { key: string; name: string; }
export interface Module { slug: string; name: string; base_monthly: number | null; sub_services: SubService[]; }
export interface Band { id: string; label: string; factor: number; }
export interface Pricing {
  environment_step: number;
  sla_factors: Record<string, number>;
  hosting_factors: Record<string, number>;
  bands: Record<'users' | 'data' | 'nodes', Band[]>;
}
export interface Catalog {
  version: number; currency: string; modules: Module[]; pricing: Pricing; disclaimer: string;
}
