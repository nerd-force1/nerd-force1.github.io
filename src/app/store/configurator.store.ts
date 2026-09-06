import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { pipe, switchMap, tap } from 'rxjs';
import { CatalogService } from '../core/catalog.service';
import { Catalog } from '../core/catalog.models';
import { computeEstimate, Selection } from './configurator.estimate';

interface ConfiguratorState {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
  selection: Selection;
}

const initialSelection: Selection = {
  slugs: new Set<string>(),
  environments: 1,
  usersBand: '1-25',
  dataBand: '<1tb',
  nodesBand: '1-3',
  hosting: 'hetzner',
  sla: 'standard',
};

const initial: ConfiguratorState = { catalog: null, loading: false, error: null, selection: initialSelection };

export const ConfiguratorStore = signalStore(
  { providedIn: 'root' },
  withState(initial),
  withComputed((store) => ({
    estimate: computed(() => {
      const cat = store.catalog();
      return cat ? computeEstimate(cat, store.selection()) : { amount: 0, hasCustom: false };
    }),
    selectedCount: computed(() => store.selection().slugs.size),
  })),
  withMethods((store, catalogService = inject(CatalogService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          catalogService.getCatalog().pipe(
            tap({
              next: (catalog) => patchState(store, { catalog, loading: false }),
              error: () => patchState(store, { error: 'catalog_unavailable', loading: false }),
            }),
          ),
        ),
      ),
    ),
    toggleModule(slug: string) {
      const slugs = new Set(store.selection().slugs);
      slugs.has(slug) ? slugs.delete(slug) : slugs.add(slug);
      patchState(store, { selection: { ...store.selection(), slugs } });
    },
    setScale(patch: Partial<Selection>) {
      patchState(store, { selection: { ...store.selection(), ...patch } });
    },
    reset() {
      patchState(store, { selection: { ...initialSelection, slugs: new Set<string>() } });
    },
  })),
);
