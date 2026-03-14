'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Restaurant, FilterState } from '@/types/restaurant';

const DEFAULT_FILTERS: FilterState = {
  grades: ['A', 'B', 'C'],
  boroughs: ['1'],
  cuisines: [],
  inspectionYears: [],
  criticalOnly: false,
  gradedOnly: false,
};

interface RestaurantState {
  restaurants: Restaurant[];
  filters: FilterState;
  loading: boolean;
  totalCount: number;
  capped: boolean;
  error: string | null;
  pinnedRestaurant: Restaurant | null;
  flyToTarget: { longitude: number; latitude: number } | null;
}

type RestaurantAction =
  | { type: 'SET_RESTAURANTS'; restaurants: Restaurant[]; total: number; capped: boolean }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_FILTER'; key: keyof FilterState; value: FilterState[keyof FilterState] }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PINNED_RESTAURANT'; restaurant: Restaurant | null }
  | { type: 'SET_FLY_TO'; longitude: number; latitude: number }
  | { type: 'CLEAR_FLY_TO' };

function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case 'SET_RESTAURANTS':
      return {
        ...state,
        restaurants: action.restaurants,
        totalCount: action.total,
        capped: action.capped,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
      };
    case 'RESET_FILTERS':
      return { ...state, filters: { ...DEFAULT_FILTERS } };
    case 'SET_PINNED_RESTAURANT':
      return { ...state, pinnedRestaurant: action.restaurant };
    case 'SET_FLY_TO':
      return { ...state, flyToTarget: { longitude: action.longitude, latitude: action.latitude } };
    case 'CLEAR_FLY_TO':
      return { ...state, flyToTarget: null };
    default:
      return state;
  }
}

interface RestaurantContextValue {
  state: RestaurantState;
  dispatch: React.Dispatch<RestaurantAction>;
}

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(restaurantReducer, {
    restaurants: [],
    filters: { ...DEFAULT_FILTERS },
    loading: true,
    totalCount: 0,
    capped: false,
    error: null,
    pinnedRestaurant: null,
    flyToTarget: null,
  });

  return (
    <RestaurantContext.Provider value={{ state, dispatch }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurantContext must be used within RestaurantProvider');
  return ctx;
}
