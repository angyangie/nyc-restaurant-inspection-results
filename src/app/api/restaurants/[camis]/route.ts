import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Restaurant } from '@/types/restaurant';
import { GRADE_COLORS_RGB } from '@/utils/constants';

interface DbRow {
  camis: string;
  dba: string;
  boro: string;
  boro_code: number | null;
  building: string;
  street: string;
  zipcode: string;
  phone: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  community_board: string;
  council_district: string;
  nta: string;
  current_grade: string;
  current_score: number | null;
  grade_date: string | null;
  last_inspection_date: string | null;
  last_inspection_year: number | null;
  total_inspections: number;
  has_critical_violation: number;
}

export function GET(
  _req: NextRequest,
  { params }: { params: { camis: string } }
) {
  const { camis } = params;
  const db = new Database(path.resolve('data/restaurants.db'), { readonly: true });

  const row = db
    .prepare(`SELECT * FROM restaurants WHERE camis = ?`)
    .get(camis) as DbRow | undefined;

  db.close();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const restaurant: Restaurant = {
    camis: row.camis,
    dba: row.dba,
    boro: row.boro,
    boroCode: row.boro_code,
    building: row.building,
    street: row.street,
    zipcode: row.zipcode,
    phone: row.phone,
    cuisine: row.cuisine,
    latitude: row.latitude,
    longitude: row.longitude,
    communityBoard: row.community_board,
    councilDistrict: row.council_district,
    nta: row.nta,
    currentGrade: row.current_grade ?? '',
    currentScore: row.current_score,
    gradeDate: row.grade_date,
    lastInspectionDate: row.last_inspection_date,
    lastInspectionYear: row.last_inspection_year,
    totalInspections: row.total_inspections,
    hasCriticalViolation: row.has_critical_violation === 1,
    gradeColor: GRADE_COLORS_RGB[row.current_grade ?? ''] ?? GRADE_COLORS_RGB[''],
  };

  return NextResponse.json(restaurant);
}
