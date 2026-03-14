import styles from './RestaurantTooltip.module.scss';
import { TooltipInfo } from '@/types/restaurant';
import { GRADE_HEX, GRADE_LABELS, BOROUGH_CODE_TO_NAME } from '@/utils/constants';

interface RestaurantTooltipProps {
  info: TooltipInfo;
}

export function RestaurantTooltip({ info }: RestaurantTooltipProps) {
  const { restaurant: r, x, y } = info;

  const address = [r.building, r.street].filter(Boolean).join(' ') || '—';
  const boroughName = r.boroCode ? BOROUGH_CODE_TO_NAME[String(r.boroCode)] || r.boro : r.boro;
  const grade = r.currentGrade || '';
  const gradeLabel = GRADE_LABELS[grade] ?? 'Ungraded';
  const gradeColor = GRADE_HEX[grade] ?? GRADE_HEX[''];

  return (
    <div
      className={styles.tooltip}
      style={{ left: x + 12, top: y - 12 }}
    >
      <div className={styles.name}>{r.dba || '—'}</div>
      <div className={styles.address}>
        {address}
        <span className={styles.borough}>{boroughName}</span>
      </div>

      <div className={styles.grade} style={{ color: gradeColor }}>
        {gradeLabel}
      </div>

      <div className={styles.grid}>
        <span className={styles.key}>Cuisine</span>
        <span className={styles.val}>{r.cuisine || '—'}</span>

        {r.currentScore !== null && (
          <>
            <span className={styles.key}>Score</span>
            <span className={styles.val}>{r.currentScore} (lower = better)</span>
          </>
        )}

        {r.lastInspectionDate && (
          <>
            <span className={styles.key}>Last Inspected</span>
            <span className={styles.val}>{r.lastInspectionDate}</span>
          </>
        )}

        {r.hasCriticalViolation && (
          <>
            <span className={styles.key}>Critical</span>
            <span className={styles.val} style={{ color: '#e74c3c' }}>Yes</span>
          </>
        )}
      </div>
    </div>
  );
}
