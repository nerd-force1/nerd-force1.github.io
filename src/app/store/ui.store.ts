import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

/** Which fixed background layer the shell renders. Home is the only 'journey' page (#82). */
export type BackgroundMode = 'topology' | 'journey';

export interface UiState {
  mobileNavOpen: boolean;
  backgroundMode: BackgroundMode;
}

const initialState: UiState = {
  mobileNavOpen: false,
  // Topology is the default because it is what every page but home uses, and because a
  // page that forgets to declare a mode should get the cheap, safe layer.
  backgroundMode: 'topology',
};

// Language lives in core/locale.service.ts, driven by the URL (#58). It used to be
// detected here from the browser, which fought the router and meant the server
// always rendered German.
export const UiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    toggleMobileNav(): void {
      patchState(store, { mobileNavOpen: !store.mobileNavOpen() });
    },
    closeMobileNav(): void {
      patchState(store, { mobileNavOpen: false });
    },
    setBackgroundMode(mode: BackgroundMode): void {
      patchState(store, { backgroundMode: mode });
    },
  })),
);
