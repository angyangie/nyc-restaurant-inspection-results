import Database from 'better-sqlite3';
import path from 'path';
import { GRADE_COLORS_RGB } from '@/utils/constants';
import { NextRequest, NextResponse } from 'next/server';
import { Restaurant } from '@/types/restaurant';

const RESULT_CAP = 10_000;

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

export function GET(req: NextRequest) {
  const db = new Database(path.resolve('data/restaurants.db'), { readonly: true });
  const p = req.nextUrl.searchParams;

  const conditions: string[] = [];
  const params: unknown[] = [];

  function addIn(col: string, key: string) {
    const vals = p.getAll(key);
    if (vals.length) {
      conditions.push(`${col} IN (${vals.map(() => '?').join(',')})`);
      params.push(...vals);
    }
  }

  // Grade filter: empty string means "ungraded" (includes 'N' = not yet graded)
  const grades = p.getAll('grades');
  if (grades.length) {
    const nonEmpty = grades.filter((g) => g !== '');
    const hasEmpty = grades.includes('');
    if (nonEmpty.length && hasEmpty) {
      conditions.push(
        `(current_grade IN (${nonEmpty.map(() => '?').join(',')}) OR current_grade = '' OR current_grade = 'N' OR current_grade IS NULL)`
      );
      params.push(...nonEmpty);
    } else if (nonEmpty.length) {
      conditions.push(`current_grade IN (${nonEmpty.map(() => '?').join(',')})`);
      params.push(...nonEmpty);
    } else {
      // hasEmpty only
      conditions.push(`(current_grade = '' OR current_grade = 'N' OR current_grade IS NULL)`);
    }
  }

  addIn('boro_code', 'boroughs');
  addIn('cuisine', 'cuisines');
  addIn('last_inspection_year', 'years');

  if (p.get('criticalOnly') === 'true') {
    conditions.push('has_critical_violation = 1');
  }

  if (p.get('gradedOnly') === 'true') {
    conditions.push(`current_grade IN ('A','B','C','Z')`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = (
    db.prepare(`SELECT COUNT(*) as n FROM restaurants ${where}`).get(...params) as { n: number }
  ).n;

  const rows = db.prepare(`SELECT * FROM restaurants ${where} LIMIT ${RESULT_CAP}`).all(
    ...params
  ) as DbRow[];

  db.close();

  const restaurants: Restaurant[] = rows.map((r) => ({
    camis: r.camis,
    dba: r.dba,
    boro: r.boro,
    boroCode: r.boro_code,
    building: r.building,
    street: r.street,
    zipcode: r.zipcode,
    phone: r.phone,
    cuisine: r.cuisine,
    latitude: r.latitude,
    longitude: r.longitude,
    communityBoard: r.community_board,
    councilDistrict: r.council_district,
    nta: r.nta,
    currentGrade: r.current_grade ?? '',
    currentScore: r.current_score,
    gradeDate: r.grade_date,
    lastInspectionDate: r.last_inspection_date,
    lastInspectionYear: r.last_inspection_year,
    totalInspections: r.total_inspections,
    hasCriticalViolation: r.has_critical_violation === 1,
    gradeColor: GRADE_COLORS_RGB[r.current_grade ?? ''] ?? GRADE_COLORS_RGB[''],
  }));

  return NextResponse.json({ restaurants, total, capped: total > RESULT_CAP });
}
