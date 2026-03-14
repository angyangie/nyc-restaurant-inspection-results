// node scripts/build-db.mjs  (run once after CSV is in place)
import Database from 'better-sqlite3';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

const BOROUGH_MAP = {
  'Manhattan': '1',
  'Bronx': '2',
  'Brooklyn': '3',
  'Queens': '4',
  'Staten Island': '5',
  '0': '0',
};

function parseDate(s) {
  if (!s || !s.trim()) return null;
  const cleaned = s.trim().split(' ')[0];
  const parts = cleaned.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  return { month, day, year };
}

function toIso(s) {
  const d = parseDate(s);
  if (!d) return null;
  // Treat 01/01/1900 as NULL
  if (d.year === 1900 && d.month === 1 && d.day === 1) return null;
  const m = String(d.month).padStart(2, '0');
  const day = String(d.day).padStart(2, '0');
  return `${d.year}-${m}-${day}`;
}

const csvPath = path.resolve(
  'DOHMH_New_York_City_Restaurant_Inspection_Results_20260314.csv'
);
if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found at ${csvPath}`);
  process.exit(1);
}

const dbPath = path.resolve('data/restaurants.db');
fs.mkdirSync('data', { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.exec(`
  CREATE TABLE restaurants (
    camis TEXT PRIMARY KEY,
    dba TEXT,
    boro TEXT,
    boro_code INTEGER,
    building TEXT,
    street TEXT,
    zipcode TEXT,
    phone TEXT,
    cuisine TEXT,
    latitude REAL,
    longitude REAL,
    community_board TEXT,
    council_district TEXT,
    nta TEXT,
    current_grade TEXT,
    current_score INTEGER,
    grade_date TEXT,
    last_inspection_date TEXT,
    last_inspection_year INTEGER,
    total_inspections INTEGER,
    has_critical_violation INTEGER
  );

  CREATE TABLE inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camis TEXT NOT NULL,
    inspection_date TEXT,
    inspection_year INTEGER,
    action TEXT,
    violation_code TEXT,
    violation_description TEXT,
    critical_flag TEXT,
    score INTEGER,
    grade TEXT,
    grade_date TEXT,
    inspection_type TEXT,
    record_date TEXT,
    FOREIGN KEY (camis) REFERENCES restaurants(camis)
  );
`);

// Collect all rows grouped by CAMIS first
console.log('Parsing CSV and grouping by CAMIS…');
const byCAMIS = new Map(); // camis -> { meta, rows[] }

const stream = createReadStream(csvPath);

await new Promise((resolve, reject) => {
  Papa.parse(stream, {
    header: true,
    skipEmptyLines: true,
    step(result) {
      const row = result.data;
      const camis = (row['CAMIS'] || '').trim();
      if (!camis) return;

      if (!byCAMIS.has(camis)) {
        byCAMIS.set(camis, {
          meta: {
            dba: (row['DBA'] || '').trim(),
            boro: (row['BORO'] || '').trim(),
            building: (row['BUILDING'] || '').trim(),
            street: (row['STREET'] || '').trim(),
            zipcode: (row['ZIPCODE'] || '').trim(),
            phone: (row['PHONE'] || '').trim(),
            cuisine: (row['CUISINE DESCRIPTION'] || '').trim(),
            community_board: (row['Community Board'] || '').trim(),
            council_district: (row['Council District'] || '').trim(),
            nta: (row['NTA'] || '').trim(),
          },
          rows: [],
          lats: [],
          lons: [],
        });
      }

      const entry = byCAMIS.get(camis);

      // Collect valid lat/lons
      const lat = parseFloat(row['Latitude'] || '');
      const lon = parseFloat(row['Longitude'] || '');
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        entry.lats.push(lat);
        entry.lons.push(lon);
      }

      // Update meta with non-empty values (in case first row was sparse)
      if (!entry.meta.dba && row['DBA']) entry.meta.dba = row['DBA'].trim();
      if (!entry.meta.boro && row['BORO']) entry.meta.boro = row['BORO'].trim();
      if (!entry.meta.cuisine && row['CUISINE DESCRIPTION']) entry.meta.cuisine = row['CUISINE DESCRIPTION'].trim();
      if (!entry.meta.nta && row['NTA']) entry.meta.nta = row['NTA'].trim();

      entry.rows.push({
        inspection_date: toIso(row['INSPECTION DATE']),
        inspection_date_raw: (row['INSPECTION DATE'] || '').trim(),
        action: (row['ACTION'] || '').trim(),
        violation_code: (row['VIOLATION CODE'] || '').trim(),
        violation_description: (row['VIOLATION DESCRIPTION'] || '').trim(),
        critical_flag: (row['CRITICAL FLAG'] || '').trim(),
        score_raw: (row['SCORE'] || '').trim(),
        grade: (row['GRADE'] || '').trim(),
        grade_date: toIso(row['GRADE DATE']),
        record_date: toIso(row['RECORD DATE']),
        inspection_type: (row['INSPECTION TYPE'] || '').trim(),
      });
    },
    complete() { resolve(); },
    error(err) { reject(err); },
  });
});

console.log(`Grouped ${byCAMIS.size.toLocaleString()} unique restaurants.`);

// Build restaurants + inspections
const insertRestaurant = db.prepare(`
  INSERT INTO restaurants VALUES (
    @camis, @dba, @boro, @boro_code, @building, @street, @zipcode, @phone,
    @cuisine, @latitude, @longitude, @community_board, @council_district, @nta,
    @current_grade, @current_score, @grade_date, @last_inspection_date,
    @last_inspection_year, @total_inspections, @has_critical_violation
  )
`);

const insertInspection = db.prepare(`
  INSERT INTO inspections (
    camis, inspection_date, inspection_year, action, violation_code,
    violation_description, critical_flag, score, grade, grade_date,
    inspection_type, record_date
  ) VALUES (
    @camis, @inspection_date, @inspection_year, @action, @violation_code,
    @violation_description, @critical_flag, @score, @grade, @grade_date,
    @inspection_type, @record_date
  )
`);

const insertRestaurantBatch = db.transaction((rows) => {
  for (const r of rows) insertRestaurant.run(r);
});

const insertInspectionBatch = db.transaction((rows) => {
  for (const r of rows) insertInspection.run(r);
});

let restaurantCount = 0;
let skippedCount = 0;
let inspectionCount = 0;
let inspectionBatch = [];

const restaurantBatch = [];
// Track valid CAMISes so we only insert their inspections
const validCamisInspections = []; // { camis, rows }

for (const [camis, entry] of byCAMIS) {
  const { meta, rows, lats, lons } = entry;

  // Skip if no valid coordinates
  if (lats.length === 0) {
    skippedCount++;
    continue;
  }

  // Use first valid lat/lon
  const latitude = lats[0];
  const longitude = lons[0];

  // Also skip if out of NYC bounds
  if (latitude < 40.45 || latitude > 40.95 || longitude < -74.3 || longitude > -73.65) {
    skippedCount++;
    continue;
  }

  // Borough handling
  const boroRaw = meta.boro;
  let boroNorm = boroRaw;
  if (boroRaw === '0') boroNorm = 'Unknown';
  const boroCode = BOROUGH_MAP[boroRaw] !== undefined ? parseInt(BOROUGH_MAP[boroRaw], 10) : null;

  // Sort rows by inspection_date desc (nulls last)
  const sorted = [...rows].sort((a, b) => {
    if (!a.inspection_date && !b.inspection_date) return 0;
    if (!a.inspection_date) return 1;
    if (!b.inspection_date) return -1;
    return b.inspection_date.localeCompare(a.inspection_date);
  });

  // Derive current_grade: most recent row with non-empty grade
  let current_grade = '';
  let current_score = null;
  let grade_date = null;
  for (const r of sorted) {
    if (r.grade && r.grade.trim()) {
      current_grade = r.grade.trim();
      const scoreNum = parseInt(r.score_raw, 10);
      current_score = isNaN(scoreNum) ? null : scoreNum;
      grade_date = r.grade_date;
      break;
    }
  }

  // last_inspection_date: most recent with valid (non-null) date
  const last_inspection_date = sorted.find((r) => r.inspection_date)?.inspection_date ?? null;
  const last_inspection_year = last_inspection_date ? parseInt(last_inspection_date.substring(0, 4), 10) : null;

  // has_critical_violation: any row on the most recent inspection date with critical_flag = "Critical"
  let has_critical_violation = 0;
  if (last_inspection_date) {
    for (const r of rows) {
      if (r.inspection_date === last_inspection_date && r.critical_flag === 'Critical') {
        has_critical_violation = 1;
        break;
      }
    }
  }

  restaurantBatch.push({
    camis,
    dba: meta.dba,
    boro: boroNorm,
    boro_code: boroCode,
    building: meta.building,
    street: meta.street,
    zipcode: meta.zipcode,
    phone: meta.phone,
    cuisine: meta.cuisine,
    latitude,
    longitude,
    community_board: meta.community_board,
    council_district: meta.council_district,
    nta: meta.nta,
    current_grade,
    current_score,
    grade_date,
    last_inspection_date,
    last_inspection_year,
    total_inspections: rows.length,
    has_critical_violation,
  });

  // Queue inspections for this valid CAMIS
  validCamisInspections.push({ camis, rows });

  restaurantCount++;

  if (restaurantBatch.length >= 1000) {
    insertRestaurantBatch(restaurantBatch.splice(0));
  }
}

// Flush remaining restaurants first (must exist before inspections due to FK)
if (restaurantBatch.length > 0) insertRestaurantBatch(restaurantBatch);

console.log(`Restaurants inserted: ${restaurantCount.toLocaleString()}. Now inserting inspections…`);

// Insert inspections
for (const { camis, rows } of validCamisInspections) {
  for (const r of rows) {
    const scoreNum = parseInt(r.score_raw, 10);
    inspectionBatch.push({
      camis,
      inspection_date: r.inspection_date,
      inspection_year: r.inspection_date ? parseInt(r.inspection_date.substring(0, 4), 10) : null,
      action: r.action,
      violation_code: r.violation_code,
      violation_description: r.violation_description,
      critical_flag: r.critical_flag,
      score: isNaN(scoreNum) ? null : scoreNum,
      grade: r.grade,
      grade_date: r.grade_date,
      inspection_type: r.inspection_type,
      record_date: r.record_date,
    });
    inspectionCount++;

    if (inspectionBatch.length >= 5000) {
      insertInspectionBatch(inspectionBatch);
      inspectionBatch = [];
      if (inspectionCount % 50000 === 0) {
        console.log(`  ${inspectionCount.toLocaleString()} inspection rows inserted…`);
      }
    }
  }
}

// Flush remaining inspections
if (inspectionBatch.length > 0) insertInspectionBatch(inspectionBatch);

// Create indexes
db.exec(`
  CREATE INDEX idx_boro ON restaurants (boro_code);
  CREATE INDEX idx_grade ON restaurants (current_grade);
  CREATE INDEX idx_cuisine ON restaurants (cuisine);
  CREATE INDEX idx_last_year ON restaurants (last_inspection_year);
  CREATE INDEX idx_critical ON restaurants (has_critical_violation);
  CREATE INDEX idx_grade_boro ON restaurants (current_grade, boro_code);
  CREATE INDEX idx_insp_camis ON inspections (camis);
  CREATE INDEX idx_insp_year ON inspections (inspection_year);
`);

db.close();

console.log(`Done.`);
console.log(`  Restaurants inserted: ${restaurantCount.toLocaleString()}`);
console.log(`  Restaurants skipped (no valid coords): ${skippedCount.toLocaleString()}`);
console.log(`  Inspection rows inserted: ${inspectionCount.toLocaleString()}`);
