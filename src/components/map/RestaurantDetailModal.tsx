'use client';

import { useState, useEffect } from 'react';
import styles from './RestaurantDetailModal.module.scss';
import { Restaurant, Inspection } from '@/types/restaurant';
import { GRADE_HEX, GRADE_LABELS, BOROUGH_CODE_TO_NAME } from '@/utils/constants';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
}

function GradeBadge({ grade }: { grade: string }) {
  const color = GRADE_HEX[grade] ?? GRADE_HEX[''];
  const label = GRADE_LABELS[grade] ?? 'Ungraded';
  return (
    <span
      className={styles.gradeBadge}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

function CriticalBadge({ flag }: { flag: string }) {
  if (flag === 'Critical') {
    return <span className={styles.criticalBadge}>Critical</span>;
  }
  if (flag === 'Not Critical') {
    return <span className={styles.notCriticalBadge}>Not Critical</span>;
  }
  return null;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <>
      <span className={styles.key}>{label}</span>
      <span className={styles.val}>{value}</span>
    </>
  );
}

export function RestaurantDetailModal({ restaurant, onClose }: RestaurantDetailModalProps) {
  const isOpen = restaurant !== null;
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspLoading, setInspLoading] = useState(false);

  useEffect(() => {
    if (!restaurant) {
      setInspections([]);
      return;
    }
    setInspLoading(true);
    fetch(`/api/restaurants/${restaurant.camis}/inspections`)
      .then((r) => r.json())
      .then((data: Inspection[]) => {
        setInspections(data);
        setInspLoading(false);
      })
      .catch(() => setInspLoading(false));
  }, [restaurant?.camis]);

  if (!restaurant && !isOpen) return null;

  const r = restaurant;
  if (!r) return null;

  const address = [r.building, r.street].filter(Boolean).join(' ');
  const boroughName = r.boroCode ? BOROUGH_CODE_TO_NAME[String(r.boroCode)] || r.boro : r.boro;

  // Group inspections by date+type
  const grouped = groupInspections(inspections);

  return (
    <div className={styles.overlay}>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {r && (
          <>
            <div className={styles.header}>
              <div className={styles.headerText}>
                <div className={styles.headerName}>{r.dba || '—'}</div>
                <div className={styles.headerAddress}>
                  {address}
                  {r.zipcode ? `, ${r.zipcode}` : ''}
                </div>
                <div className={styles.headerBorough}>{boroughName}</div>
              </div>
              <div className={styles.headerRight}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            {/* Section 1 — Restaurant Info */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Restaurant</div>
              <div className={styles.grid}>
                <Row label="Cuisine" value={r.cuisine} />
                <Row label="Phone" value={r.phone} />
                <Row label="Borough" value={boroughName} />
                <Row label="NTA" value={r.nta} />
                <Row label="Community Board" value={r.communityBoard} />
                <Row label="Council District" value={r.councilDistrict} />
                <Row label="CAMIS" value={r.camis} />
              </div>
            </div>

            {/* Section 2 — Current Grade */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Current Grade</div>
              <div className={styles.gradeRow}>
                <GradeBadge grade={r.currentGrade} />
                {r.currentScore !== null && (
                  <span className={styles.score}>
                    Score: <strong>{r.currentScore}</strong>
                    <span className={styles.scoreNote}>(lower is better)</span>
                  </span>
                )}
              </div>
              <div className={styles.grid} style={{ marginTop: 10 }}>
                <Row label="Grade Date" value={r.gradeDate ?? undefined} />
                <Row label="Last Inspected" value={r.lastInspectionDate ?? undefined} />
                <Row
                  label="Critical Flag"
                  value={r.hasCriticalViolation ? 'Yes — has critical violation' : undefined}
                />
                <Row label="Total Inspections" value={String(r.totalInspections)} />
              </div>
            </div>

            {/* Section 3 — Inspection History */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Inspection History</div>
              {inspLoading && <div className={styles.inspLoading}>Loading…</div>}
              {!inspLoading && grouped.length === 0 && (
                <div className={styles.inspEmpty}>No inspection records.</div>
              )}
              {!inspLoading && grouped.map((group, i) => (
                <div key={i} className={styles.inspGroup}>
                  <div className={styles.inspGroupHeader}>
                    <span className={styles.inspDate}>{group.date ?? 'Unknown date'}</span>
                    {group.type && <span className={styles.inspType}>{group.type}</span>}
                    {group.action && <span className={styles.inspAction}>{group.action}</span>}
                    <div className={styles.inspMeta}>
                      {group.grade && <GradeBadge grade={group.grade} />}
                      {group.score !== null && (
                        <span className={styles.inspScore}>Score {group.score}</span>
                      )}
                    </div>
                  </div>
                  {group.violations.length > 0 && (
                    <div className={styles.violations}>
                      {group.violations.map((v, j) => (
                        <div key={j} className={styles.violation}>
                          <div className={styles.violationHeader}>
                            {v.violationCode && (
                              <span className={styles.vCode}>{v.violationCode}</span>
                            )}
                            <CriticalBadge flag={v.criticalFlag} />
                          </div>
                          {v.violationDescription && (
                            <div className={styles.vDesc}>{v.violationDescription}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {group.violations.length === 0 && (
                    <div className={styles.noViolations}>No violations recorded</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface InspectionGroup {
  date: string | null;
  type: string;
  action: string;
  grade: string;
  score: number | null;
  violations: Inspection[];
}

function groupInspections(inspections: Inspection[]): InspectionGroup[] {
  // Group by inspection_date + inspection_type combo
  const map = new Map<string, InspectionGroup>();
  for (const insp of inspections) {
    const key = `${insp.inspectionDate ?? 'null'}||${insp.inspectionType}`;
    if (!map.has(key)) {
      map.set(key, {
        date: insp.inspectionDate,
        type: insp.inspectionType,
        action: insp.action,
        grade: insp.grade,
        score: insp.score,
        violations: [],
      });
    }
    const group = map.get(key)!;
    // Update grade/score from the row that has them
    if (!group.grade && insp.grade) group.grade = insp.grade;
    if (group.score === null && insp.score !== null) group.score = insp.score;
    if (!group.action && insp.action) group.action = insp.action;
    // Add as violation if has a code or description
    if (insp.violationCode || insp.violationDescription) {
      group.violations.push(insp);
    }
  }
  return Array.from(map.values());
}
