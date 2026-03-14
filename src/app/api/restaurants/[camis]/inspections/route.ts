import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { Inspection } from '@/types/restaurant';

interface DbRow {
  id: number;
  camis: string;
  inspection_date: string | null;
  inspection_year: number | null;
  action: string;
  violation_code: string;
  violation_description: string;
  critical_flag: string;
  score: number | null;
  grade: string;
  grade_date: string | null;
  inspection_type: string;
  record_date: string | null;
}

export function GET(
  _req: NextRequest,
  { params }: { params: { camis: string } }
) {
  const { camis } = params;
  const db = new Database(path.resolve('data/restaurants.db'), { readonly: true });

  const rows = db
    .prepare(
      `SELECT * FROM inspections WHERE camis = ?
       ORDER BY inspection_date DESC NULLS LAST, id DESC`
    )
    .all(camis) as DbRow[];

  db.close();

  const inspections: Inspection[] = rows.map((r) => ({
    id: r.id,
    camis: r.camis,
    inspectionDate: r.inspection_date,
    inspectionYear: r.inspection_year,
    action: r.action,
    violationCode: r.violation_code,
    violationDescription: r.violation_description,
    criticalFlag: r.critical_flag,
    score: r.score,
    grade: r.grade,
    gradeDate: r.grade_date,
    inspectionType: r.inspection_type,
    recordDate: r.record_date,
  }));

  return NextResponse.json(inspections);
}
