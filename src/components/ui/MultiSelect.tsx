import { useState } from 'react';
import styles from './MultiSelect.module.scss';
import classnames from 'classnames';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, searchable, placeholder }: MultiSelectProps) {
  const [query, setQuery] = useState('');

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function selectAll() {
    onChange(filteredOptions.map((o) => o.value));
  }

  function clearAll() {
    onChange([]);
  }

  const filteredOptions = searchable && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className={styles.container}>
      {searchable && (
        <input
          className={styles.search}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || 'Search…'}
        />
      )}
      {filteredOptions.length > 3 && (
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={selectAll}>All</button>
          <button className={styles.actionBtn} onClick={clearAll}>None</button>
        </div>
      )}
      <div className={styles.options}>
        {filteredOptions.map((opt) => (
          <button
            key={opt.value}
            className={classnames(styles.option, {
              [styles.selected]: selected.includes(opt.value),
            })}
            onClick={() => toggle(opt.value)}
            title={opt.label}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
