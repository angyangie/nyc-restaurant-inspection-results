'use client';

import { useState } from 'react';
import styles from './FilterSidebar.module.scss';
import { useRestaurantContext } from '@/context/RestaurantContext';
import { useRestaurantOptions } from '@/hooks/useRestaurantOptions';
import { FilterState } from '@/types/restaurant';
import { GradeFilter } from './GradeFilter';
import { BoroughFilter } from './BoroughFilter';
import { CuisineFilter } from './CuisineFilter';
import { InspectionYearFilter } from './InspectionYearFilter';
import { CriticalViolationsFilter } from './CriticalViolationsFilter';
import classnames from 'classnames';

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'grade', label: 'Grade' },
  { id: 'borough', label: 'Borough' },
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'year', label: 'Inspection Year' },
  { id: 'flags', label: 'Flags' },
];

interface FilterSidebarProps {
  filteredCount: number;
  capped: boolean;
}

export function FilterSidebar({ filteredCount, capped }: FilterSidebarProps) {
  const { state, dispatch } = useRestaurantContext();
  const { filters } = state;
  const { options } = useRestaurantOptions();

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['grade', 'borough'])
  );

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    dispatch({ type: 'SET_FILTER', key, value });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.count}>
          {filteredCount.toLocaleString()} restaurants
        </span>
        <button
          className={styles.resetBtn}
          onClick={() => dispatch({ type: 'RESET_FILTERS' })}
        >
          Reset All
        </button>
      </div>

      {capped && (
        <div className={styles.capWarning}>
          Showing first 10,000 of {filteredCount.toLocaleString()} results. Narrow your filters.
        </div>
      )}

      <div className={styles.sections}>
        {SECTIONS.map((section) => (
          <div key={section.id} className={styles.section}>
            <button
              className={classnames(styles.sectionHeader, {
                [styles.open]: openSections.has(section.id),
              })}
              onClick={() => toggleSection(section.id)}
            >
              <span>{section.label}</span>
              <span className={styles.chevron}>
                {openSections.has(section.id) ? '▲' : '▼'}
              </span>
            </button>

            {openSections.has(section.id) && (
              <div className={styles.sectionBody}>
                {section.id === 'grade' && (
                  <GradeFilter
                    selected={filters.grades}
                    onChange={(v) => setFilter('grades', v)}
                  />
                )}
                {section.id === 'borough' && (
                  <BoroughFilter
                    selected={filters.boroughs}
                    onChange={(v) => setFilter('boroughs', v)}
                  />
                )}
                {section.id === 'cuisine' && (
                  <CuisineFilter
                    cuisines={options.cuisines}
                    selected={filters.cuisines}
                    onChange={(v) => setFilter('cuisines', v)}
                  />
                )}
                {section.id === 'year' && (
                  <InspectionYearFilter
                    years={options.years}
                    selected={filters.inspectionYears}
                    onChange={(v) => setFilter('inspectionYears', v)}
                  />
                )}
                {section.id === 'flags' && (
                  <CriticalViolationsFilter
                    criticalOnly={filters.criticalOnly}
                    gradedOnly={filters.gradedOnly}
                    onCriticalChange={(v) => setFilter('criticalOnly', v)}
                    onGradedChange={(v) => setFilter('gradedOnly', v)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
