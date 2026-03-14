# NYC Restaurant Inspections

An interactive map of New York City restaurant health inspection results, built with Next.js and deck.gl.

## Overview

Browse and filter ~30,000 NYC restaurants across all five boroughs using data from the NYC Department of Health and Mental Hygiene (DOHMH). Each dot on the map represents a restaurant, colored by its most recent inspection grade. Click any dot to see full inspection history, violation details, and contact information.

## Features

- **Interactive map** — pan, zoom, and explore the entire city
- **Grade filter** — filter by grade: A, B, C, Pending, or Ungraded
- **Search** — find a specific restaurant by name and fly to it on the map
- **Critical violations filter** — surface only restaurants with critical violations
- **Inspection detail modal** — view all past inspections, scores, violation codes, and descriptions for any restaurant
- **Zoom controls** — `+` / `-` buttons for keyboard/touch-friendly zooming

## Grades

| Grade | Meaning |
|---|---|
| A | Score 0–13 (excellent) |
| B | Score 14–27 |
| C | Score 28+ |
| Pending | Grade pending re-inspection |
| Ungraded | No grade issued |

## Data

Source: [DOHMH New York City Restaurant Inspection Results](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j) via NYC Open Data.

The raw CSV (~297K inspection records) is processed into a SQLite database of ~30K unique restaurants with their full inspection history. Only inspections from 2023 onward are included.

## Stack

- [Next.js 14](https://nextjs.org/) — framework
- [deck.gl](https://deck.gl/) — WebGL map layers
- [react-map-gl](https://visgl.github.io/react-map-gl/) + [MapLibre GL](https://maplibre.org/) — base map
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — database
- TypeScript, SCSS Modules

## Local Development

**1. Install dependencies**
```bash
npm install
```

**2. Add the source CSV**

Download the DOHMH inspection results CSV from NYC Open Data and place it at the project root:
```
DOHMH_New_York_City_Restaurant_Inspection_Results_<date>.csv
```

**3. Build the database**
```bash
node scripts/build-db.mjs
```

This parses the CSV and creates `data/restaurants.db`.

**4. Run the dev server**
```bash
node node_modules/next/dist/bin/next dev --port 3002
```

Open [http://localhost:3002](http://localhost:3002).
