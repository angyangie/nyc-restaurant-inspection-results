'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRestaurantSearch } from '@/hooks/useRestaurantSearch';
import { useRestaurantContext } from '@/context/RestaurantContext';
import { SearchEntry, Restaurant } from '@/types/restaurant';
import styles from './RestaurantSearch.module.scss';

export function RestaurantSearch() {
  const { search, loading } = useRestaurantSearch();
  const { dispatch } = useRestaurantContext();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const results = search(query);
      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIndex(-1);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [query, search]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectEntry = useCallback(
    async (entry: SearchEntry) => {
      setQuery(entry.dba);
      setOpen(false);
      try {
        const res = await fetch(`/api/restaurants/${entry.camis}`);
        if (!res.ok) return;
        const restaurant: Restaurant = await res.json();
        dispatch({ type: 'SET_PINNED_RESTAURANT', restaurant });
        dispatch({
          type: 'SET_FLY_TO',
          longitude: restaurant.longitude,
          latitude: restaurant.latitude,
        });
      } catch {
        // ignore fetch errors
      }
    },
    [dispatch]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectEntry(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <svg className={styles.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          className={styles.input}
          type="text"
          placeholder={loading ? 'Loading…' : 'Search restaurants…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Search restaurants"
          aria-haspopup="listbox"
          aria-expanded={open}
          autoComplete="off"
        />
        {query && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            aria-label="Clear search"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <ul className={styles.dropdown} role="listbox">
          {suggestions.map((entry, i) => (
            <li
              key={entry.camis}
              role="option"
              aria-selected={i === activeIndex}
              className={`${styles.item} ${i === activeIndex ? styles.active : ''}`}
              onMouseDown={() => selectEntry(entry)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className={styles.itemName}>{entry.dba}</span>
              <span className={styles.itemMeta}>
                {entry.building} {entry.street} · {entry.nta} / {entry.boro}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
