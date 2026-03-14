import styles from './MapLegend.module.scss';
import { GRADE_HEX, GRADE_LABELS } from '@/utils/constants';

const GRADES = ['A', 'B', 'C', 'Z', ''];

export function MapLegend() {
  return (
    <div className={styles.legend}>
      {GRADES.map((grade) => (
        <div key={grade || 'ungraded'} className={styles.item}>
          <span
            className={styles.dot}
            style={{ background: GRADE_HEX[grade] }}
          />
          <span className={styles.label}>{GRADE_LABELS[grade]}</span>
        </div>
      ))}
    </div>
  );
}
