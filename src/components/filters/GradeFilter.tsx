import styles from './GradeFilter.module.scss';
import classnames from 'classnames';
import { GRADE_HEX } from '@/utils/constants';

const GRADE_OPTIONS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'Z', label: 'Pending' },
  { value: '', label: 'Ungraded' },
];

interface GradeFilterProps {
  selected: string[];
  onChange: (grades: string[]) => void;
}

export function GradeFilter({ selected, onChange }: GradeFilterProps) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className={styles.buttons}>
      {GRADE_OPTIONS.map((opt) => (
        <button
          key={opt.value || 'ungraded'}
          className={classnames(styles.btn, {
            [styles.selected]: selected.includes(opt.value),
          })}
          style={
            selected.includes(opt.value)
              ? { borderColor: GRADE_HEX[opt.value], color: GRADE_HEX[opt.value] }
              : {}
          }
          onClick={() => toggle(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
