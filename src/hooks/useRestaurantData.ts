import { useEffect, useRef } from 'react';
import { useRestaurantContext } from '@/context/RestaurantContext';
import { FilterState } from '@/types/restaurant';

function buildSearchParams(filters: FilterState): URLSearchParams {
  const p = new URLSearchParams();

  for (const g of filters.grades)           p.append('grades', g);
  for (const b of filters.boroughs)         p.append('boroughs', b);
  for (const c of filters.cuisines)         p.append('cuisines', c);
  for (const y of filters.inspectionYears)  p.append('years', y);

  if (filters.criticalOnly) p.set('criticalOnly', 'true');
  if (filters.gradedOnly)   p.set('gradedOnly', 'true');

  return p;
}

export function useRestaurantData() {
  const { state, dispatch } = useRestaurantContext();
  const { filters } = state;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pinnedRef = useRef(state.pinnedRestaurant);

  // Keep pinnedRef current without triggering the fetch effect
  useEffect(() => {
    pinnedRef.current = state.pinnedRestaurant;
  }, [state.pinnedRestaurant]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch({ type: 'SET_LOADING', loading: true });

      try {
        const params = buildSearchParams(filters);
        const res = await fetch(`/api/restaurants?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        dispatch({
          type: 'SET_RESTAURANTS',
          restaurants: data.restaurants,
          total: data.total,
          capped: data.capped,
        });

        // Clear pin if pinned restaurant is no longer in the new result set
        const pinnedCamis = pinnedRef.current?.camis;
        if (pinnedCamis && !data.restaurants.find((r: { camis: string }) => r.camis === pinnedCamis)) {
          dispatch({ type: 'SET_PINNED_RESTAURANT', restaurant: null });
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        dispatch({ type: 'SET_ERROR', error: String(err) });
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, dispatch]);
}
