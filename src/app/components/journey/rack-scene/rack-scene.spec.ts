import { TestBed } from '@angular/core/testing';
import { RackScene } from './rack-scene';
import { JourneyStore } from '../../../store/journey.store';

describe('RackScene', () => {
  it('does not enable the scene when the environment cannot run it', async () => {
    // jsdom: no WebGL2 context, no resolved custom properties. Both gates must hold.
    const fixture = TestBed.configureTestingModule({ imports: [RackScene] }).createComponent(RackScene);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(TestBed.inject(JourneyStore).enabled()).toBe(false);
  });

  it('renders a canvas host regardless, so the poster has somewhere to sit', () => {
    const fixture = TestBed.configureTestingModule({ imports: [RackScene] }).createComponent(RackScene);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
  });
});
