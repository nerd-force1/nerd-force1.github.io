import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Ambient background. Three glows drift blue → violet → teal as the page scrolls,
 * beneath the topology dot grid.
 *
 * Every layer is inert: aria-hidden, pointer-events-none, -z-10. The animation is
 * CSS-only (compositor-driven), so this component ships no behaviour at all — it exists
 * to own the markup, not to run anything.
 */
@Component({
  selector: 'nf-topology-bg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
      <div class="ramp-glow ramp-glow-near"></div>
      <div class="ramp-glow ramp-glow-mid"></div>
      <div class="ramp-glow ramp-glow-far"></div>
      <div class="absolute inset-0 opacity-40 topology-grid"></div>
    </div>
  `,
})
export class TopologyBg {}
