import { TestBed } from '@angular/core/testing';
import { UiStore } from './ui.store';

describe('UiStore', () => {
  it('toggles the mobile nav open and closed', () => {
    const store = TestBed.configureTestingModule({ providers: [UiStore] }).inject(UiStore);
    expect(store.mobileNavOpen()).toBe(false);
    store.toggleMobileNav();
    expect(store.mobileNavOpen()).toBe(true);
    store.closeMobileNav();
    expect(store.mobileNavOpen()).toBe(false);
  });

  it('defaults to the topology background', () => {
    const store = TestBed.configureTestingModule({ providers: [UiStore] }).inject(UiStore);
    expect(store.backgroundMode()).toBe('topology');
  });

  it('switches the background mode', () => {
    const store = TestBed.configureTestingModule({ providers: [UiStore] }).inject(UiStore);
    store.setBackgroundMode('journey');
    expect(store.backgroundMode()).toBe('journey');
    store.setBackgroundMode('topology');
    expect(store.backgroundMode()).toBe('topology');
  });
});
