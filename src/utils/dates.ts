import { format, parseISO, addDays, isAfter, isValid } from 'date-fns';
import type { IsoDateString } from '../types/tracking';

export function toIsoDateString(date: Date): IsoDateString {
  return format(date, 'yyyy-MM-dd') as IsoDateString;
}

export function safeParseIsoDate(date: string): Date | null {
  const parsed = parseISO(date);
  if (!isValid(parsed)) return null;
  return parsed;
}

export function enumerateIsoDates(start: IsoDateString, end: IsoDateString): IsoDateString[] {
  const startDate = safeParseIsoDate(start);
  const endDate = safeParseIsoDate(end);
  if (!startDate || !endDate) return [];

  const dates: IsoDateString[] = [];
  let cursor = startDate;

  // Prevent infinite loops by limiting range.
  for (let i = 0; i < 400; i += 1) {
    dates.push(toIsoDateString(cursor));
    if (!isAfter(endDate, cursor)) break;
    cursor = addDays(cursor, 1);
  }

  return dates;
}
