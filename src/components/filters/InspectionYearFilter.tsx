import { MultiSelect } from '@/components/ui/MultiSelect';

interface InspectionYearFilterProps {
  years: number[];
  selected: string[];
  onChange: (years: string[]) => void;
}

export function InspectionYearFilter({ years, selected, onChange }: InspectionYearFilterProps) {
  const options = years.map((y) => ({ value: String(y), label: String(y) }));
  return (
    <MultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
    />
  );
}
