import { useState, useEffect, useRef, useCallback } from 'react';
import Fuse from 'fuse.js';
import { SearchEntry } from '@/types/restaurant';

let cachedEntries: SearchEntry[] | null = null;
let cachePromise: Promise<SearchEntry[]> | null = null;

function fetchEntries(): Promise<SearchEntry[]> {
  if (cachedEntries) return Promise.resolve(cachedEntries);
  if (!cachePromise) {
    cachePromise = fetch('/api/restaurants/names')
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        cachedEntries = data;
        return data;
      });
  }
  return cachePromise;
}

export function useRestaurantSearch() {
  const [loading, setLoading] = useState(!cachedEntries);
  const fuseRef = useRef<Fuse<SearchEntry> | null>(null);

  useEffect(() => {
    if (cachedEntries && !fuseRef.current) {
      fuseRef.current = new Fuse(cachedEntries, {
        keys: [
          { name: 'dba', weight: 0.8 },
          { name: 'street', weight: 0.2 },
        ],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
        shouldSort: true,
      });
      setLoading(false);
      return;
    }
    if (fuseRef.current) return;

    fetchEntries().then((entries) => {
      fuseRef.current = new Fuse(entries, {
        keys: [
          { name: 'dba', weight: 0.8 },
          { name: 'street', weight: 0.2 },
        ],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
        shouldSort: true,
      });
      setLoading(false);
    });
  }, []);

  const search = useCallback((query: string): SearchEntry[] => {
    if (!fuseRef.current || query.length < 2) return [];
    return fuseRef.current.search(query, { limit: 8 }).map((r) => r.item);
  }, []);

  return { search, loading };
}
