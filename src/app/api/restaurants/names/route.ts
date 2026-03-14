import Database from 'better-sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';
import { SearchEntry } from '@/types/restaurant';

export function GET() {
  const db = new Database(path.resolve('data/restaurants.db'), { readonly: true });

  const rows = db
    .prepare(`SELECT camis, dba, building, street, nta, boro FROM restaurants ORDER BY dba`)
    .all() as SearchEntry[];

  db.close();

  return NextResponse.json(rows);
}
