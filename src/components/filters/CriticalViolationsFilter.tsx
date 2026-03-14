import styles from './CriticalViolationsFilter.module.scss';

interface CriticalViolationsFilterProps {
  criticalOnly: boolean;
  gradedOnly: boolean;
  onCriticalChange: (v: boolean) => void;
  onGradedChange: (v: boolean) => void;
}

export function CriticalViolationsFilter({
  criticalOnly,
  gradedOnly,
  onCriticalChange,
  onGradedChange,
}: CriticalViolationsFilterProps) {
  return (
    <div className={styles.container}>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={criticalOnly}
          onChange={(e) => onCriticalChange(e.target.checked)}
        />
        <span>Critical violations only</span>
      </label>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={gradedOnly}
          onChange={(e) => onGradedChange(e.target.checked)}
        />
        <span>Graded restaurants only</span>
      </label>
    </div>
  );
}
