'use client';

import dynamic from 'next/dynamic';
import styles from './AppShell.module.scss';
import { Header } from './Header';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { LoadingProgress } from '@/components/ui/LoadingProgress';
import { useRestaurantContext } from '@/context/RestaurantContext';

const RestaurantMap = dynamic(() => import('@/components/map/RestaurantMap'), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder} />,
});

export function AppShell() {
  const { state } = useRestaurantContext();

  return (
    <div className={styles.shell}>
      {state.loading && <LoadingProgress />}
      <Header totalCount={state.totalCount} loading={state.loading} />
      <div className={styles.body}>
        <FilterSidebar filteredCount={state.totalCount} capped={state.capped} />
        <main className={styles.mapArea}>
          <RestaurantMap />
        </main>
      </div>
    </div>
  );
}
