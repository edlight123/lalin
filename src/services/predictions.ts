import { addDays, differenceInCalendarDays } from 'date-fns';

import type { IsoDateString, PeriodEntry } from '../types/tracking';
import { safeParseIsoDate, toIsoDateString } from '../utils/dates';

export type CycleStats = {
  hasEnoughData: boolean;
  cycleLengthDays?: number;
  cycleLengthRangeDays?: { min: number; max: number };
  periodLengthDays?: number;
  lastPeriodStart?: IsoDateString;
};

export type Predictions = {
  nextPeriod?: {
    start: IsoDateString;
    range: { start: IsoDateString; end: IsoDateString };
    daysUntilStart: number;
  };
  ovulation?: {
    date: IsoDateString;
  };
  fertileWindow?: {
    start: IsoDateString;
    end: IsoDateString;
  };
  stats: CycleStats;
};

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function computeCycleStats(periods: PeriodEntry[]): CycleStats {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const starts = sorted
    .map((p) => safeParseIsoDate(p.startDate))
    .filter((d): d is Date => Boolean(d));

  const cycleDiffs: number[] = [];
  for (let i = 1; i < starts.length; i += 1) {
    const diff = differenceInCalendarDays(starts[i], starts[i - 1]);
    if (diff > 0) cycleDiffs.push(diff);
  }

  const periodLengths: number[] = [];
  for (const p of sorted) {
    if (!p.endDate) continue;
    const start = safeParseIsoDate(p.startDate);
    const end = safeParseIsoDate(p.endDate);
    if (!start || !end) continue;
    const days = differenceInCalendarDays(end, start) + 1;
    if (days > 0 && days <= 15) periodLengths.push(days);
  }

  const baseCycle = median(cycleDiffs);
  const basePeriod = median(periodLengths) ?? 5;

  // Robust uncertainty: MAD (median absolute deviation).
  const mad = baseCycle
    ? median(cycleDiffs.map((d) => Math.abs(d - baseCycle))) ?? 0
    : 0;

  const uncertainty = clamp(Math.max(2, mad), 2, 7);

  const cycleLengthDays = baseCycle ? clamp(baseCycle, 21, 45) : undefined;

  return {
    hasEnoughData: (cycleDiffs.length >= 1) && Boolean(cycleLengthDays),
    cycleLengthDays,
    cycleLengthRangeDays: cycleLengthDays
      ? {
          min: clamp(cycleLengthDays - uncertainty, 21, 45),
          max: clamp(cycleLengthDays + uncertainty, 21, 45),
        }
      : undefined,
    periodLengthDays: clamp(basePeriod, 2, 10),
    lastPeriodStart: sorted.length ? sorted[sorted.length - 1].startDate : undefined,
  };
}

export function computePredictions(periods: PeriodEntry[], today: Date = new Date()): Predictions {
  const stats = computeCycleStats(periods);

  if (!stats.cycleLengthDays || !stats.lastPeriodStart) {
    return { stats };
  }

  const lastStart = safeParseIsoDate(stats.lastPeriodStart);
  if (!lastStart) return { stats };

  const nextStartDate = addDays(lastStart, stats.cycleLengthDays);
  const start = toIsoDateString(nextStartDate);

  const rangeDays = stats.cycleLengthRangeDays ?? { min: stats.cycleLengthDays - 2, max: stats.cycleLengthDays + 2 };
  const rangeStart = toIsoDateString(addDays(lastStart, rangeDays.min));
  const rangeEnd = toIsoDateString(addDays(lastStart, rangeDays.max));

  const daysUntilStart = differenceInCalendarDays(nextStartDate, today);

  // Ovulation estimate: ~14 days before expected next period.
  const ovulationDate = addDays(nextStartDate, -14);
  const ovulation = toIsoDateString(ovulationDate);

  const fertileStart = toIsoDateString(addDays(ovulationDate, -5));
  const fertileEnd = ovulation;

  return {
    stats,
    nextPeriod: {
      start,
      range: { start: rangeStart, end: rangeEnd },
      daysUntilStart,
    },
    ovulation: { date: ovulation },
    fertileWindow: { start: fertileStart, end: fertileEnd },
  };
}
