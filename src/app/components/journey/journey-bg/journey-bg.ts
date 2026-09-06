import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RackScene } from '../rack-scene/rack-scene';
import { JourneyStore } from '../../../store/journey.store';

/**
 * The homepage's fixed background layer — the datacenter the page sits in.
 *
 * Occupies the same slot as nf-topology-bg (fixed inset-0 -z-10) and replaces it on home
 * only, switched by UiStore.backgroundMode. Two fixed full-viewport layers stacked would
 * mean one of them painting for nothing.
 *
 * Inert by construction, like the layer it replaces: aria-hidden, pointer-events-none,
 * -z-10. Nothing here is conveyed by anything but text elsewhere on the page.
 *
 * The WebGL canvas lives in nf-rack-scene, mounted into #journey-canvas-host. The ambient
 * field beneath it is CSS and stays visible when the scene never starts — which is every
 * SSR render, every reduced-motion visitor and every browser without WebGL, so it is a real
 * state rather than a placeholder.
 *
 * JourneyStore.enabled() is true only once RackScene's own start() has actually run — see
 * its constructor. Everywhere else (SSR, prefers-reduced-motion, Save-Data, no WebGL2, an
 * unreadable palette) it stays false, and the static poster below covers all of it in one
 * branch rather than each caller re-deriving "is the scene really running".
 */
@Component({
  selector: 'nf-journey-bg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RackScene],
  template: `
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
      <div class="ramp-glow ramp-glow-far"></div>
      @if (!journey.enabled()) {
        <img src="/journey/rack-poster.avif" alt="" class="absolute inset-0 h-full w-full object-cover" />
      }
      <div id="journey-canvas-host" class="absolute inset-0"><nf-rack-scene /></div>
    </div>
  `,
})
export class JourneyBg {
  protected readonly journey = inject(JourneyStore);
}
