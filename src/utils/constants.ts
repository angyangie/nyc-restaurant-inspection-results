export const BOROUGH_CODE_TO_NAME: Record<string, string> = {
  '1': 'Manhattan',
  '2': 'Bronx',
  '3': 'Brooklyn',
  '4': 'Queens',
  '5': 'Staten Island',
};

export const BOROUGH_FILTER_OPTIONS = [
  { value: '1', label: 'Manhattan' },
  { value: '2', label: 'Bronx' },
  { value: '3', label: 'Brooklyn' },
  { value: '4', label: 'Queens' },
  { value: '5', label: 'Staten Island' },
];

export const GRADE_COLORS_RGB: Record<string, [number, number, number, number]> = {
  A: [39, 174, 96, 210],
  B: [241, 196, 15, 220],
  C: [231, 76, 60, 200],
  Z: [155, 89, 182, 200],
  N: [150, 150, 150, 150],
  '': [150, 150, 150, 150],
};

export const GRADE_HEX: Record<string, string> = {
  A: '#27AE60',
  B: '#F1C40F',
  C: '#E74C3C',
  Z: '#9B59B6',
  N: '#969696',
  '': '#969696',
};

export const GRADE_LABELS: Record<string, string> = {
  A: 'Grade A',
  B: 'Grade B',
  C: 'Grade C',
  Z: 'Grade Z (Pending)',
  N: 'Not Yet Graded',
  '': 'Ungraded',
};

export const GRADE_OPTIONS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'Z', label: 'Z' },
  { value: '', label: 'Ungraded' },
];

export const NYC_CENTER: [number, number] = [-74.006, 40.7128];
export const NYC_DEFAULT_ZOOM = 11;

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
