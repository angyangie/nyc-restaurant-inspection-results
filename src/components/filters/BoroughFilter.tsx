import { MultiSelect } from '@/components/ui/MultiSelect';
import { BOROUGH_FILTER_OPTIONS } from '@/utils/constants';

interface BoroughFilterProps {
  selected: string[];
  onChange: (boroughs: string[]) => void;
}

export function BoroughFilter({ selected, onChange }: BoroughFilterProps) {
  return (
    <MultiSelect
      options={BOROUGH_FILTER_OPTIONS}
      selected={selected}
      onChange={onChange}
    />
  );
}
