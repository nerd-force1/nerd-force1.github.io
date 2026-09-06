import type { IconName } from '../components/marketing/icon/icon';

export type PillarSlug = 'core-platform' | 'gitops-k8s' | 'security-ops' | 'collab-apps' | 'custom';

export interface Pillar {
  slug: PillarSlug;
  icon: IconName;
  titleKey: string;      // i18n key -> pillars.<slug>.title
  oneLinerKey: string;   // -> pillars.<slug>.oneLiner
  capabilityKeys: string[]; // -> pillars.<slug>.capabilities.N
}

const ICONS: Record<PillarSlug, IconName> = {
  'core-platform': 'lock', 'gitops-k8s': 'layers', 'security-ops': 'shield', 'collab-apps': 'cloud', 'custom': 'wrench',
};

export const PILLARS: Pillar[] = (Object.keys(ICONS) as PillarSlug[]).map(slug => ({
  slug,
  icon: ICONS[slug],
  titleKey: `pillars.${slug}.title`,
  oneLinerKey: `pillars.${slug}.oneLiner`,
  capabilityKeys: [0, 1, 2, 3].map(n => `pillars.${slug}.capabilities.${n}`),
}));

export const pillarBySlug = (slug: string): Pillar | undefined => PILLARS.find(p => p.slug === slug);
