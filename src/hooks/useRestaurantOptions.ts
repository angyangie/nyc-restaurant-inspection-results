import { useState, useEffect } from 'react';

interface RestaurantOptions {
  cuisines: string[];
  years: number[];
}

export function useRestaurantOptions() {
  const [options, setOptions] = useState<RestaurantOptions>({ cuisines: [], years: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants/options')
      .then((r) => r.json())
      .then((data: RestaurantOptions) => {
        setOptions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { options, loading };
}
