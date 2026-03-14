'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { ScatterplotLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';
import { DeckGLOverlay } from './DeckGLOverlay';
import { RestaurantTooltip } from './RestaurantTooltip';
import { RestaurantDetailModal } from './RestaurantDetailModal';
import { useRestaurantContext } from '@/context/RestaurantContext';
import { useMapViewState } from '@/hooks/useMapViewState';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { Restaurant, TooltipInfo } from '@/types/restaurant';
import { MAP_STYLE } from '@/utils/constants';
import styles from './RestaurantMap.module.scss';

import 'maplibre-gl/dist/maplibre-gl.css';

export default function RestaurantMap() {
  const { state, dispatch } = useRestaurantContext();
  const { viewState, onViewStateChange } = useMapViewState();
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const mapRef = useRef<MapRef>(null);

  useRestaurantData();

  // Fly to pinned restaurant when flyToTarget is set
  useEffect(() => {
    if (!state.flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [state.flyToTarget.longitude, state.flyToTarget.latitude],
      zoom: 16,
      duration: 1200,
    });
    dispatch({ type: 'CLEAR_FLY_TO' });
  }, [state.flyToTarget, dispatch]);

  // Auto-open modal when a restaurant is pinned via search
  useEffect(() => {
    if (state.pinnedRestaurant) {
      setSelectedRestaurant(state.pinnedRestaurant);
    }
  }, [state.pinnedRestaurant]);

  const handleHover = useCallback(
    (info: PickingInfo<Restaurant>) => {
      if (info.object) {
        setTooltip({ restaurant: info.object, x: info.x, y: info.y });
        setIsHovering(true);
      } else {
        setTooltip(null);
        setIsHovering(false);
      }
    },
    []
  );

  const handleClick = useCallback((info: PickingInfo<Restaurant>) => {
    if (info.object) setSelectedRestaurant(info.object);
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const layers = useMemo(() => {
    const base = new ScatterplotLayer<Restaurant>({
      id: 'restaurants',
      data: state.restaurants,
      getPosition: (d) => [d.longitude, d.latitude],
      getFillColor: (d) => d.gradeColor,
      getRadius: 40,
      radiusMinPixels: 3,
      radiusMaxPixels: 10,
      pickable: true,
      onHover: handleHover,
      onClick: handleClick,
      updateTriggers: {
        getFillColor: state.restaurants.length,
      },
    });

    const pinned = state.pinnedRestaurant
      ? new ScatterplotLayer<Restaurant>({
          id: 'pinned-restaurant',
          data: [state.pinnedRestaurant],
          getPosition: (d) => [d.longitude, d.latitude],
          getFillColor: (d) => d.gradeColor,
          getLineColor: [255, 255, 255, 255],
          lineWidthMinPixels: 2,
          stroked: true,
          getRadius: 60,
          radiusMinPixels: 6,
          radiusMaxPixels: 14,
          pickable: true,
          onHover: handleHover,
          onClick: handleClick,
        })
      : null;

    return pinned ? [base, pinned] : [base];
  }, [state.restaurants, state.pinnedRestaurant, handleHover, handleClick]);

  return (
    <div className={styles.mapContainer} style={{ cursor: isHovering ? 'pointer' : 'grab' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onViewStateChange}
        mapStyle={MAP_STYLE}
        attributionControl={false}
        reuseMaps
      >
        <DeckGLOverlay layers={layers} />
      </Map>
      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={handleZoomIn} aria-label="Zoom in">+</button>
        <button className={styles.zoomBtn} onClick={handleZoomOut} aria-label="Zoom out">−</button>
      </div>
      {tooltip && <RestaurantTooltip info={tooltip} />}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
    </div>
  );
}
