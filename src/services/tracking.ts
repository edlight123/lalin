import type { PeriodEntry, SymptomEntry, IsoDateString, MoodKey } from '../types/tracking';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { getJson, setJson } from './storage';
import { enumerateIsoDates } from '../utils/dates';

const KEYS = {
  onboardingDone: 'lalin_onboarding_done_v1',
  periods: 'lalin_periods_v1',
  symptoms: 'lalin_symptoms_v1',
  moodByDate: 'lalin_mood_by_date_v1',
} as const;

export async function getOnboardingDone(): Promise<boolean> {
  return getJson<boolean>(KEYS.onboardingDone, false);
}

export async function setOnboardingDone(done: boolean): Promise<void> {
  return setJson<boolean>(KEYS.onboardingDone, done);
}

export async function listPeriods(): Promise<PeriodEntry[]> {
  return getJson<PeriodEntry[]>(KEYS.periods, []);
}

export async function getPeriodById(id: string): Promise<PeriodEntry | undefined> {
  const periods = await listPeriods();
  return periods.find((p) => p.id === id);
}

export async function addPeriod(entry: Omit<PeriodEntry, 'id' | 'createdAt'>): Promise<void> {
  const existing = await listPeriods();
  const now = new Date().toISOString();
  const withId: PeriodEntry = {
    ...entry,
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
  };
  await setJson(KEYS.periods, [withId, ...existing]);
}

export async function updatePeriod(
  id: string,
  patch: Partial<Omit<PeriodEntry, 'id' | 'createdAt'>>,
): Promise<void> {
  const existing = await listPeriods();
  const updated = existing.map((p) => (p.id === id ? { ...p, ...patch } : p));
  await setJson(KEYS.periods, updated);
}

export async function deletePeriod(id: string): Promise<void> {
  const existing = await listPeriods();
  await setJson(KEYS.periods, existing.filter((p) => p.id !== id));
}

export async function listSymptoms(): Promise<SymptomEntry[]> {
  return getJson<SymptomEntry[]>(KEYS.symptoms, []);
}

export async function getSymptomById(id: string): Promise<SymptomEntry | undefined> {
  const symptoms = await listSymptoms();
  return symptoms.find((s) => s.id === id);
}

export async function addSymptoms(entry: Omit<SymptomEntry, 'id' | 'createdAt'>): Promise<void> {
  const existing = await listSymptoms();
  const now = new Date().toISOString();
  const withId: SymptomEntry = {
    ...entry,
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
  };
  await setJson(KEYS.symptoms, [withId, ...existing]);
}

export async function updateSymptoms(
  id: string,
  patch: Partial<Omit<SymptomEntry, 'id' | 'createdAt'>>,
): Promise<void> {
  const existing = await listSymptoms();
  const updated = existing.map((s) => (s.id === id ? { ...s, ...patch } : s));
  await setJson(KEYS.symptoms, updated);
}

export async function deleteSymptoms(id: string): Promise<void> {
  const existing = await listSymptoms();
  await setJson(KEYS.symptoms, existing.filter((s) => s.id !== id));
}

type MoodByDate = Partial<Record<IsoDateString, MoodKey>>;

export async function listMoodsByDate(): Promise<MoodByDate> {
  return getJson<MoodByDate>(KEYS.moodByDate, {});
}

export async function getMoodForDate(date: IsoDateString): Promise<MoodKey | undefined> {
  const map = await getJson<MoodByDate>(KEYS.moodByDate, {});
  return map[date];
}

export async function setMoodForDate(date: IsoDateString, mood: MoodKey): Promise<void> {
  const map = await getJson<MoodByDate>(KEYS.moodByDate, {});
  await setJson<MoodByDate>(KEYS.moodByDate, { ...map, [date]: mood });
}

export function buildPeriodMarkedDates(
  periods: PeriodEntry[],
  color: string,
): MarkedDates {
  // react-native-calendars markedDates shape
  const marked: MarkedDates = {};

  for (const p of periods) {
    const start = p.startDate;
    const end = p.endDate ?? p.startDate;
    const dates = enumerateIsoDates(start, end);
    for (const d of dates) {
      marked[d] = {
        ...(marked[d] ?? {}),
        selected: true,
        selectedColor: color,
      };
    }
  }

  return marked;
}

export function mostRecentPeriodStart(periods: PeriodEntry[]): IsoDateString | null {
  for (const p of periods) {
    if (p.startDate) return p.startDate;
  }
  return null;
}
