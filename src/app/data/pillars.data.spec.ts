import { PILLARS, pillarBySlug } from './pillars.data';
import de from '../../../public/i18n/de.json';

const keyExists = (obj: unknown, path: string) =>
  path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj) !== undefined;

describe('PILLARS', () => {
  it('has 5 unique slugs', () => {
    expect(PILLARS).toHaveLength(5);
    expect(new Set(PILLARS.map(p => p.slug)).size).toBe(5);
  });
  it('every pillar resolves its title/oneLiner/capability keys in de.json', () => {
    for (const p of PILLARS) {
      expect(keyExists(de, p.titleKey)).toBe(true);
      expect(keyExists(de, p.oneLinerKey)).toBe(true);
      for (const k of p.capabilityKeys) expect(keyExists(de, k)).toBe(true);
    }
  });
  it('pillarBySlug finds and misses correctly', () => {
    expect(pillarBySlug('core-platform')?.slug).toBe('core-platform');
    expect(pillarBySlug('nope')).toBeUndefined();
  });
});
