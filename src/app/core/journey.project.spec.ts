import { projectToScreen, ProjectingCamera } from './journey.project';

/** A stub camera. Real projection is Three.js's job and is not ours to re-test. */
const stub = (ndc: { x: number; y: number }): ProjectingCamera => ({ project: () => ndc });

describe('projectToScreen', () => {
  const W = 1000, H = 600;

  it('maps NDC centre to the middle of the canvas', () => {
    expect(projectToScreen(0, 0, 0, stub({ x: 0, y: 0 }), W, H)).toEqual({ x: 500, y: 300 });
  });

  it('maps NDC top-left to pixel (0,0) — note Y flips', () => {
    expect(projectToScreen(0, 0, 0, stub({ x: -1, y: 1 }), W, H)).toEqual({ x: 0, y: 0 });
  });

  it('maps NDC bottom-right to (width, height)', () => {
    expect(projectToScreen(0, 0, 0, stub({ x: 1, y: -1 }), W, H)).toEqual({ x: 1000, y: 600 });
  });

  it('maps a quarter offset correctly', () => {
    expect(projectToScreen(0, 0, 0, stub({ x: 0.5, y: 0.5 }), W, H)).toEqual({ x: 750, y: 150 });
  });
});
