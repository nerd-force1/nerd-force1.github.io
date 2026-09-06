import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { PillarFan } from './pillar-fan';
import { PILLARS } from '../../../data/pillars.data';

describe('PillarFan', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [PillarFan],
      providers: [provideRouter([]), provideTranslateService()],
    });
    return TestBed.createComponent(PillarFan);
  }

  it('creates', () => {
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one [data-slug] wrapper per pillar, three left / two right, in PILLARS order', () => {
    const fixture = setup();
    fixture.detectChanges();

    const wrappers = fixture.nativeElement.querySelectorAll('[data-slug]');
    expect(wrappers.length).toBe(PILLARS.length);
    expect([...wrappers].map((el: HTMLElement) => el.dataset['slug'])).toEqual(PILLARS.map((p) => p.slug));

    expect(fixture.componentInstance['left'].map((p: { slug: string }) => p.slug)).toEqual(
      PILLARS.slice(0, 3).map((p) => p.slug),
    );
    expect(fixture.componentInstance['right'].map((p: { slug: string }) => p.slug)).toEqual(
      PILLARS.slice(3).map((p) => p.slug),
    );
  });
});
