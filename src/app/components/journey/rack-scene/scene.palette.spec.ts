import { readPalette, readScenePalette, CssVarReader } from './scene.palette';

const FULL: Record<string, string> = {
  '--color-pillar-core-platform': 'TOKEN-A',
  '--color-pillar-gitops-k8s': 'TOKEN-B',
  '--color-pillar-security-ops': 'TOKEN-C',
  '--color-pillar-collab-apps': 'TOKEN-D',
  '--color-pillar-custom': 'TOKEN-E',
  '--color-accent': 'TOKEN-F',
};
const readerFor = (map: Record<string, string>): CssVarReader => (n) => map[n] ?? '';

describe('readPalette', () => {
  it('reads every pillar hue and the accent off the reader', () => {
    const p = readPalette(readerFor(FULL));
    expect(p).not.toBeNull();
    expect(p!.hues['gitops-k8s']).toBe('TOKEN-B');
    expect(p!.hues['custom']).toBe('TOKEN-E');
    expect(p!.accent).toBe('TOKEN-F');
  });

  it('covers all five pillars', () => {
    const p = readPalette(readerFor(FULL));
    expect(Object.keys(p!.hues).sort()).toEqual(
      ['collab-apps', 'core-platform', 'custom', 'gitops-k8s', 'security-ops'],
    );
  });

  it('trims the whitespace getPropertyValue leaves on', () => {
    const p = readPalette(readerFor({ ...FULL, '--color-pillar-custom': '  TOKEN-E ' }));
    expect(p!.hues['custom']).toBe('TOKEN-E');
  });

  it('returns null when a pillar token is missing, rather than substituting a fallback', () => {
    const { ['--color-pillar-security-ops']: _drop, ...missing } = FULL;
    expect(readPalette(readerFor(missing))).toBeNull();
  });

  it('returns null when a token is present but blank', () => {
    expect(readPalette(readerFor({ ...FULL, '--color-accent': '   ' }))).toBeNull();
  });

});

const SCENE_FULL: Record<string, string> = {
  '--color-scene-metal': 'S-A',
  '--color-scene-metal-deep': 'S-B',
  '--color-scene-plate': 'S-C',
  '--color-scene-vent': 'S-D',
  '--color-scene-handle': 'S-E',
  '--color-scene-cavity': 'S-F',
  '--color-scene-floor': 'S-G',
  '--color-scene-key': 'S-H',
  '--color-scene-rim': 'S-I',
  '--color-scene-fill': 'S-J',
  '--color-scene-grid': 'S-K',
  '--color-scene-wall': 'S-L',
};

describe('readScenePalette', () => {
  it('reads every material and light surface', () => {
    const p = readScenePalette(readerFor(SCENE_FULL));
    expect(p).not.toBeNull();
    expect(p!.metal).toBe('S-A');
    expect(p!.floor).toBe('S-G');
    expect(p!.fill).toBe('S-J');
    expect(Object.keys(p!).length).toBe(12);
  });

  it('trims values', () => {
    const p = readScenePalette(readerFor({ ...SCENE_FULL, '--color-scene-rim': '  S-I ' }));
    expect(p!.rim).toBe('S-I');
  });

  it('returns null when any surface token is missing, rather than substituting a fallback', () => {
    const { ['--color-scene-plate']: _drop, ...missing } = SCENE_FULL;
    expect(readScenePalette(readerFor(missing))).toBeNull();
  });

  it('returns null when a surface token is blank', () => {
    expect(readScenePalette(readerFor({ ...SCENE_FULL, '--color-scene-key': '  ' }))).toBeNull();
  });
});
