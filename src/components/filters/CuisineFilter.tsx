import { MultiSelect } from '@/components/ui/MultiSelect';

interface CuisineFilterProps {
  cuisines: string[];
  selected: string[];
  onChange: (cuisines: string[]) => void;
}

export function CuisineFilter({ cuisines, selected, onChange }: CuisineFilterProps) {
  const options = cuisines.map((c) => ({ value: c, label: c }));
  return (
    <MultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
      searchable
      placeholder="Search cuisines…"
    />
  );
}
