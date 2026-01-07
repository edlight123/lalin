import type { PeriodEntry, SymptomEntry, IsoDateString, MoodKey, SexualActivityEntry, OvulationEntry } from '../types/tracking';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { getJson, removeKey, setJson } from './storage';
import { enumerateIsoDates } from '../utils/dates';

const KEYS = {
  onboardingDone: 'lalin_onboarding_done_v1',
  periods: 'lalin_periods_v1',
  symptoms: 'lalin_symptoms_v1',
  moodByDate: 'lalin_mood_by_date_v1',
  sexualActivity: 'lalin_sexual_activity_v1',
  ovulation: 'lalin_ovulation_v1',
} as const;

export type ExportBundleV1 = {
  version: 1;
  exportedAt: string;
  onboardingDone: boolean;
  periods: PeriodEntry[];
  symptoms: SymptomEntry[];
  moodsByDate: MoodByDate;
  sexualActivity: SexualActivityEntry[];
  ovulation: OvulationEntry[];
};

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

export async function listSexualActivity(): Promise<SexualActivityEntry[]> {
  return getJson<SexualActivityEntry[]>(KEYS.sexualActivity, []);
}

export async function getSexualActivityById(id: string): Promise<SexualActivityEntry | undefined> {
  const activity = await listSexualActivity();
  return activity.find((a) => a.id === id);
}

export async function addSexualActivity(entry: Omit<SexualActivityEntry, 'id' | 'createdAt'>): Promise<void> {
  const existing = await listSexualActivity();
  const now = new Date().toISOString();
  const withId: SexualActivityEntry = {
    ...entry,
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
  };
  await setJson(KEYS.sexualActivity, [withId, ...existing]);
}

export async function updateSexualActivity(
  id: string,
  patch: Partial<Omit<SexualActivityEntry, 'id' | 'createdAt'>>,
): Promise<void> {
  const existing = await listSexualActivity();
  const updated = existing.map((a) => (a.id === id ? { ...a, ...patch } : a));
  await setJson(KEYS.sexualActivity, updated);
}

export async function deleteSexualActivity(id: string): Promise<void> {
  const existing = await listSexualActivity();
  await setJson(KEYS.sexualActivity, existing.filter((a) => a.id !== id));
}

export async function listOvulation(): Promise<OvulationEntry[]> {
  return getJson<OvulationEntry[]>(KEYS.ovulation, []);
}

export async function getOvulationById(id: string): Promise<OvulationEntry | undefined> {
  const ovulation = await listOvulation();
  return ovulation.find((o) => o.id === id);
}

export async function addOvulation(entry: Omit<OvulationEntry, 'id' | 'createdAt'>): Promise<void> {
  const existing = await listOvulation();
  const now = new Date().toISOString();
  const withId: OvulationEntry = {
    ...entry,
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    createdAt: now,
  };
  await setJson(KEYS.ovulation, [withId, ...existing]);
}

export async function updateOvulation(
  id: string,
  patch: Partial<Omit<OvulationEntry, 'id' | 'createdAt'>>,
): Promise<void> {
  const existing = await listOvulation();
  const updated = existing.map((o) => (o.id === id ? { ...o, ...patch } : o));
  await setJson(KEYS.ovulation, updated);
}

export async function deleteOvulation(id: string): Promise<void> {
  const existing = await listOvulation();
  await setJson(KEYS.ovulation, existing.filter((o) => o.id !== id));
}

export async function exportAllData(): Promise<ExportBundleV1> {
  const [onboardingDone, periods, symptoms, moodsByDate, sexualActivity, ovulation] = await Promise.all([
    getOnboardingDone(),
    listPeriods(),
    listSymptoms(),
    listMoodsByDate(),
    listSexualActivity(),
    listOvulation(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    onboardingDone,
    periods,
    symptoms,
    moodsByDate,
    sexualActivity,
    ovulation,
  };
}

export async function resetAllData(): Promise<void> {
  await Promise.all([
    removeKey(KEYS.onboardingDone),
    removeKey(KEYS.periods),
    removeKey(KEYS.symptoms),
    removeKey(KEYS.moodByDate),
    removeKey(KEYS.sexualActivity),
    removeKey(KEYS.ovulation),
  ]);
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
