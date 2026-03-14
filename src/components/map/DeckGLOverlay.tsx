import { useEffect, useRef } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Layer } from '@deck.gl/core';

interface DeckGLOverlayProps {
  layers: Layer[];
}

export function DeckGLOverlay({ layers }: DeckGLOverlayProps) {
  const { current: map } = useMap();
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;
    const mapInstance = map.getMap();

    const overlay = new MapboxOverlay({ layers });
    overlayRef.current = overlay;
    mapInstance.addControl(overlay as unknown as maplibregl.IControl);

    return () => {
      mapInstance.removeControl(overlay as unknown as maplibregl.IControl);
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    overlayRef.current?.setProps({ layers });
  }, [layers]);

  return null;
}
