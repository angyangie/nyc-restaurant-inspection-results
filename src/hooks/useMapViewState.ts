import { useState, useCallback } from 'react';
import { NYC_CENTER, NYC_DEFAULT_ZOOM } from '@/utils/constants';

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: NYC_CENTER[0],
  latitude: NYC_CENTER[1],
  zoom: NYC_DEFAULT_ZOOM,
  pitch: 0,
  bearing: 0,
};

export function useMapViewState() {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  const onViewStateChange = useCallback(({ viewState: vs }: { viewState: ViewState }) => {
    setViewState(vs);
  }, []);

  return { viewState, onViewStateChange };
}
