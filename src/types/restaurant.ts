export type Grade = 'A' | 'B' | 'C' | 'Z' | '';

export interface Restaurant {
  camis: string;
  dba: string;
  boro: string;
  boroCode: number | null;
  building: string;
  street: string;
  zipcode: string;
  phone: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  communityBoard: string;
  councilDistrict: string;
  nta: string;
  currentGrade: string;
  currentScore: number | null;
  gradeDate: string | null;
  lastInspectionDate: string | null;
  lastInspectionYear: number | null;
  totalInspections: number;
  hasCriticalViolation: boolean;
  gradeColor: [number, number, number, number];
}

export interface Inspection {
  id: number;
  camis: string;
  inspectionDate: string | null;
  inspectionYear: number | null;
  action: string;
  violationCode: string;
  violationDescription: string;
  criticalFlag: string;
  score: number | null;
  grade: string;
  gradeDate: string | null;
  inspectionType: string;
  recordDate: string | null;
}

export interface FilterState {
  grades: string[];
  boroughs: string[];
  cuisines: string[];
  inspectionYears: string[];
  criticalOnly: boolean;
  gradedOnly: boolean;
}

export interface SearchEntry {
  camis: string;
  dba: string;
  building: string;
  street: string;
  nta: string;
  boro: string;
}

export interface TooltipInfo {
  restaurant: Restaurant;
  x: number;
  y: number;
}
