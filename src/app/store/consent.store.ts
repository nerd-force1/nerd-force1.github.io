import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signalStore, withState, withComputed, withMethods, withHooks, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentState {
  bannerVisible: boolean;
  consentGiven: boolean;
  categories: ConsentCategories;
}

const STORAGE_KEY = 'nf1_consent';

const initialState: ConsentState = {
  bannerVisible: false,
  consentGiven: false,
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  },
};

export const ConsentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ consentGiven, categories }) => ({
    hasAnalytics: computed(() => consentGiven() && categories().analytics),
    hasMarketing: computed(() => consentGiven() && categories().marketing),
    hasFunctional: computed(() => consentGiven() && categories().functional),
  })),
  withMethods((store) => {
    const platformId = inject(PLATFORM_ID);

    function persist(categories: ConsentCategories): void {
      if (!isPlatformBrowser(platformId)) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }

    return {
      init(): void {
        if (!isPlatformBrowser(platformId)) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const categories: ConsentCategories = JSON.parse(saved);
          patchState(store, { categories, consentGiven: true, bannerVisible: false });
        } else {
          patchState(store, { bannerVisible: true });
        }
      },

      acceptAll(): void {
        const categories: ConsentCategories = {
          necessary: true,
          analytics: true,
          marketing: true,
          functional: true,
        };
        patchState(store, { categories, consentGiven: true, bannerVisible: false });
        persist(categories);
      },

      rejectNonEssential(): void {
        const categories: ConsentCategories = {
          necessary: true,
          analytics: false,
          marketing: false,
          functional: false,
        };
        patchState(store, { categories, consentGiven: true, bannerVisible: false });
        persist(categories);
      },

      savePreferences(prefs: Omit<ConsentCategories, 'necessary'>): void {
        const categories: ConsentCategories = { necessary: true, ...prefs };
        patchState(store, { categories, consentGiven: true, bannerVisible: false });
        persist(categories);
      },

      revokeConsent(): void {
        patchState(store, {
          categories: initialState.categories,
          consentGiven: false,
          bannerVisible: true,
        });
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem(STORAGE_KEY);
        }
      },
    };
  }),
  withHooks({
    onInit(store) {
      store.init();
    },
  }),
);
