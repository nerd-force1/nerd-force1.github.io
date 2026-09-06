import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { JourneyStore } from '../../../store/journey.store';
import type { PillarSlug } from '../../../data/pillars.data';

export interface CardAnchor {
  readonly slug: PillarSlug;
  readonly x: number;
  readonly y: number;
}

/**
 * Lead lines from each pillar card to its node in the rack.
 *
 * Hue comes from a literal class map, never `stroke-pillar-${slug}` — Tailwind v4 finds class
 * names by scanning source text, so an interpolated name compiles green and emits no CSS. The
 * line would simply be invisible, with a passing build. Same trap, same fix as pillar-card.ts.
 *
 * Decorative: aria-hidden. The card→pillar mapping is already carried by each card's own title
 * and colour, so a screen reader loses nothing when these are absent — which is also every
 * viewport below lg, where the parent hides them because a fan cannot survive stacking.
 *
 * Renders nothing until the scene is actually running. Anchors only exist once a camera has
 * projected them, and a line drawn before then would point at the origin.
 */
const STROKE: Record<PillarSlug, string> = {
  'core-platform': 'stroke-pillar-core-platform',
  'gitops-k8s': 'stroke-pillar-gitops-k8s',
  'security-ops': 'stroke-pillar-security-ops',
  'collab-apps': 'stroke-pillar-collab-apps',
  'custom': 'stroke-pillar-custom',
};

@Component({
  selector: 'nf-node-leads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lines().length) {
      <svg aria-hidden="true" class="pointer-events-none fixed inset-0 -z-[5] h-full w-full">
        @for (l of lines(); track l.slug) {
          <line [attr.x1]="l.x1" [attr.y1]="l.y1" [attr.x2]="l.x2" [attr.y2]="l.y2"
                [class]="l.stroke" class="opacity-50" stroke-width="1" />
        }
      </svg>
    }
  `,
})
export class NodeLeads {
  readonly cards = input.required<CardAnchor[]>();
  private readonly store = inject(JourneyStore);

  protected readonly lines = computed(() => {
    if (!this.store.enabled()) return [];
    // Only while the section is actually pinned. Outside that window the cards are moving
    // (or off-screen entirely), and a line from a moving card to a fixed-canvas node is a
    // diagonal slash across whatever else is on screen — the first cut drew them over the
    // hero at scroll zero. Fully-visible scene (visibility 1) is the same condition by
    // construction, but progress is the signal the pin itself derives from.
    const p = this.store.progress();
    if (p <= 0.02 || this.store.visibility() < 1) return [];
    const nodes = this.store.anchors();
    return this.cards()
      .map((card) => {
        const node = nodes.find((n) => n.slug === card.slug);
        return node
          ? { slug: card.slug, x1: card.x, y1: card.y, x2: node.x, y2: node.y, stroke: STROKE[card.slug] }
          : null;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  });
}
