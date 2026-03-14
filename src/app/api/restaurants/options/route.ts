import Database from 'better-sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

export function GET() {
  const db = new Database(path.resolve('data/restaurants.db'), { readonly: true });

  const cuisineRows = db
    .prepare(`SELECT DISTINCT cuisine FROM restaurants WHERE cuisine != '' ORDER BY cuisine`)
    .all() as { cuisine: string }[];

  const yearRows = db
    .prepare(
      `SELECT DISTINCT last_inspection_year FROM restaurants
       WHERE last_inspection_year IS NOT NULL
       ORDER BY last_inspection_year DESC`
    )
    .all() as { last_inspection_year: number }[];

  db.close();

  return NextResponse.json({
    cuisines: cuisineRows.map((r) => r.cuisine),
    years: yearRows.map((r) => r.last_inspection_year),
  });
}
