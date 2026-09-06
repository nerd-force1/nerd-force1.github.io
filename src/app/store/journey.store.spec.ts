import { TestBed } from '@angular/core/testing';
import { JourneyStore } from './journey.store';

const store = () => TestBed.configureTestingModule({ providers: [JourneyStore] }).inject(JourneyStore);

describe('JourneyStore', () => {
  it('starts disabled, at zero, with no anchors', () => {
    const s = store();
    expect(s.enabled()).toBe(false);
    expect(s.progress()).toBe(0);
    expect(s.anchors()).toEqual([]);
  });

  it('tracks progress', () => {
    const s = store();
    s.setProgress(0.42);
    expect(s.progress()).toBeCloseTo(0.42, 5);
  });

  it('clamps progress into [0,1]', () => {
    const s = store();
    s.setProgress(-3);
    expect(s.progress()).toBe(0);
    s.setProgress(9);
    expect(s.progress()).toBe(1);
  });

  it('enables and disables', () => {
    const s = store();
    s.enable();
    expect(s.enabled()).toBe(true);
    s.disable();
    expect(s.enabled()).toBe(false);
  });

  it('stores node anchors', () => {
    const s = store();
    s.setAnchors([{ slug: 'gitops-k8s', x: 100, y: 200 }]);
    expect(s.anchors()).toEqual([{ slug: 'gitops-k8s', x: 100, y: 200 }]);
  });

  it('starts arrived (pinned pose) and clamps arrival into [0,1]', () => {
    const s = store();
    expect(s.arrival()).toBe(1);
    s.setArrival(0.3);
    expect(s.arrival()).toBeCloseTo(0.3, 5);
    s.setArrival(-2);
    expect(s.arrival()).toBe(0);
    s.setArrival(5);
    expect(s.arrival()).toBe(1);
  });

  it('starts invisible and clamps visibility into [0,1]', () => {
    const s = store();
    expect(s.visibility()).toBe(0);
    s.setVisibility(0.6);
    expect(s.visibility()).toBeCloseTo(0.6, 5);
    s.setVisibility(-1);
    expect(s.visibility()).toBe(0);
    s.setVisibility(2);
    expect(s.visibility()).toBe(1);
  });

  it('clears anchors when disabled, so no lead line points at a node that is gone', () => {
    const s = store();
    s.enable();
    s.setAnchors([{ slug: 'custom', x: 1, y: 2 }]);
    s.disable();
    expect(s.anchors()).toEqual([]);
  });
});
