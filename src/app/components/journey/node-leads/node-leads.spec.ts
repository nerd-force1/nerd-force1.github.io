import { TestBed } from '@angular/core/testing';
import { NodeLeads } from './node-leads';
import { JourneyStore } from '../../../store/journey.store';

describe('NodeLeads', () => {
  it('renders nothing when the scene is disabled, even with matching cards', () => {
    const fixture = TestBed.configureTestingModule({ imports: [NodeLeads] }).createComponent(NodeLeads);
    fixture.componentRef.setInput('cards', [{ slug: 'core-platform', x: 10, y: 20 }]);
    TestBed.inject(JourneyStore).setAnchors([{ slug: 'core-platform', x: 100, y: 200 }]);
    // enabled deliberately left false
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('draws a line per matched card, with the right stroke class, and skips unmatched cards', () => {
    const fixture = TestBed.configureTestingModule({ imports: [NodeLeads] }).createComponent(NodeLeads);
    fixture.componentRef.setInput('cards', [
      { slug: 'core-platform', x: 10, y: 20 },
      { slug: 'gitops-k8s', x: 30, y: 40 }, // no matching anchor below — must be dropped
    ]);
    const store = TestBed.inject(JourneyStore);
    store.enable();
    store.setProgress(0.5);
    store.setVisibility(1);
    store.setAnchors([{ slug: 'core-platform', x: 100, y: 200 }]);
    fixture.detectChanges();

    const lines = fixture.nativeElement.querySelectorAll('line');
    expect(lines.length).toBe(1);
    expect(lines[0].getAttribute('x1')).toBe('10');
    expect(lines[0].getAttribute('y1')).toBe('20');
    expect(lines[0].getAttribute('x2')).toBe('100');
    expect(lines[0].getAttribute('y2')).toBe('200');
    expect(lines[0].classList.contains('stroke-pillar-core-platform')).toBe(true);
  });

  it('hides the lines outside the pinned window, even with the scene enabled', () => {
    const fixture = TestBed.configureTestingModule({ imports: [NodeLeads] }).createComponent(NodeLeads);
    const store = TestBed.inject(JourneyStore);
    store.enable();
    store.setVisibility(1);
    store.setProgress(0); // section not pinned yet — a line here would cross the hero
    store.setAnchors([{ slug: 'core-platform', x: 100, y: 200 }]);
    fixture.componentRef.setInput('cards', [{ slug: 'core-platform', x: 10, y: 20 }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });
});
