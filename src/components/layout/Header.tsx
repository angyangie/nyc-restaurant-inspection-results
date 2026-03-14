'use client';

import { RestaurantSearch } from './RestaurantSearch';
import styles from './Header.module.scss';

interface HeaderProps {
  totalCount: number;
  loading: boolean;
}

export function Header({ totalCount, loading }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1 className={styles.h1}>NYC Restaurant Inspection Results</h1>
      </div>
      <div className={styles.search}>
        <RestaurantSearch />
      </div>
      <div className={styles.meta}>
        {loading ? (
          <span className={styles.loadingLabel}>Loading…</span>
        ) : (
          <span className={styles.badge}>
            {totalCount.toLocaleString()}
            <span className={styles.badgeLabel}>restaurants</span>
          </span>
        )}
      </div>
    </header>
  );
}
