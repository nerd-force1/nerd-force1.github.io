import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender,
  inject, signal, viewChild,
} from '@angular/core';
import { PILLARS } from '../../../data/pillars.data';
import { PillarCard } from '../../marketing/pillar-card/pillar-card';
import { NodeLeads, CardAnchor } from '../node-leads/node-leads';
import { JourneyStore } from '../../../store/journey.store';
import { arrivalProgress, heroSceneVisibility, pinProgress, sceneVisibility } from '../../../core/journey.progress';

/**
 * The pillar cards, fanned around the rack.
 *
 * Two layouts, deliberately. At lg+ the cards sit three left / two right with lead lines to
 * their node. Below lg the fan is a plain grid and the lines are gone — a lead line cannot
 * survive stacking, and the honest cost, recorded in the spec, is that phone visitors never
 * see the fan at all. The cards and the rack are the same components at every width; only
 * this arrangement branches.
 *
 * The section is tall and its inner layer sticky: that is what pins the cards against the
 * fixed canvas while the page scrolls, which is what lets a lead line drawn to a fixed-canvas
 * node stay attached to a card. A non-sticky card would slide out from under its own line.
 */
@Component({
  selector: 'nf-pillar-fan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PillarCard, NodeLeads],
  template: `
    <section #section class="relative h-[200vh]">
      <div class="sticky top-0 flex h-screen items-center">
        <div class="section grid w-full gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-16">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            @for (p of left; track p.slug) {
              <div [attr.data-slug]="p.slug"><nf-pillar-card [pillar]="p" /></div>
            }
          </div>
          <!-- The rack itself lives in the fixed canvas behind this column. -->
          <div aria-hidden="true" class="hidden lg:block lg:w-64"></div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            @for (p of right; track p.slug) {
              <div [attr.data-slug]="p.slug"><nf-pillar-card [pillar]="p" /></div>
            }
          </div>
        </div>
      </div>
      <nf-node-leads [cards]="cardAnchors()" class="hidden lg:block" />
    </section>
  `,
})
export class PillarFan {
  protected readonly left = PILLARS.slice(0, 3);
  protected readonly right = PILLARS.slice(3);

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly store = inject(JourneyStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cardAnchors = signal<CardAnchor[]>([]);

  constructor() {
    afterNextRender(() => {
      const measure = () => {
        const el = this.section().nativeElement;
        const top = el.getBoundingClientRect().top;
        this.store.setProgress(pinProgress(top, el.offsetHeight, window.innerHeight));
        // ≥lg the rack IS the hero visual: visible from scroll zero, travelling from its
        // hero pose beside the headline to its pinned pose here (arrival). Below lg the
        // hero is one column, so the rack keeps the fade-in-on-approach behaviour and the
        // arrival stays pinned at 1 — the scene never strands it halfway on a phone.
        // 1024 is Tailwind's lg, the same breakpoint that switches the fan to a grid.
        const wide = window.innerWidth >= 1024;
        this.store.setArrival(wide ? arrivalProgress(window.scrollY, top) : 1);
        this.store.setVisibility(
          wide
            ? heroSceneVisibility(top, el.offsetHeight, window.innerHeight)
            : sceneVisibility(top, el.offsetHeight, window.innerHeight),
        );
        this.cardAnchors.set(readCardAnchors(el));
      };
      measure();
      addEventListener('scroll', measure, { passive: true });
      addEventListener('resize', measure);
      this.destroyRef.onDestroy(() => {
        removeEventListener('scroll', measure);
        removeEventListener('resize', measure);
      });
    });
  }
}

/** Card edge midpoints, in viewport pixels — the end of each lead line. */
function readCardAnchors(root: HTMLElement): CardAnchor[] {
  return [...root.querySelectorAll<HTMLElement>('[data-slug]')].map((el) => {
    const r = el.getBoundingClientRect();
    const centreX = window.innerWidth / 2;
    // Point at the edge FACING the rack, not the card's centre: a line from the centre
    // would cross the card it starts from.
    return {
      slug: el.dataset['slug'] as CardAnchor['slug'],
      x: r.left + r.width / 2 < centreX ? r.right : r.left,
      y: r.top + r.height / 2,
    };
  });
}
