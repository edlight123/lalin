import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { addDays } from 'date-fns';
import type { MoodKey } from '../types/tracking';
import { listMoodsByDate, listPeriods, listSymptoms, mostRecentPeriodStart } from '../services/tracking';
import { safeParseIsoDate } from '../utils/dates';
import { useFocusEffect } from '@react-navigation/native';

type PeriodStats = {
  hasEnoughData: boolean;
  averageCycleDays?: number;
  averagePeriodDays?: number;
  periodsCount: number;
  nextPeriodDate?: string;
  last30MoodCounts: Partial<Record<MoodKey, number>>;
  last30TopSymptoms: Array<{ key: string; count: number }>;
  hint?: string;
};

const MOODS: readonly MoodKey[] = ['happy', 'sad', 'anxious', 'irritable', 'calm', 'energetic', 'tired'] as const;

export default function InsightsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [stats, setStats] = React.useState<PeriodStats>({
    hasEnoughData: false,
    periodsCount: 0,
    last30MoodCounts: {},
    last30TopSymptoms: [],
  });

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const periods = await listPeriods();
        const symptoms = await listSymptoms();
        const moodsByDate = await listMoodsByDate();

        const sorted = [...periods]
          .map((p) => ({ ...p, startDate: p.startDate, endDate: p.endDate }))
          .sort((a, b) => a.startDate.localeCompare(b.startDate));

        const startDates = sorted
          .map((p) => safeParseIsoDate(p.startDate))
          .filter((d): d is Date => Boolean(d));

        const cycleDiffs: number[] = [];
        for (let i = 1; i < startDates.length; i++) {
          const ms = startDates[i].getTime() - startDates[i - 1].getTime();
          const days = Math.round(ms / (1000 * 60 * 60 * 24));
          if (days > 0) cycleDiffs.push(days);
        }

        const periodLengths: number[] = [];
        for (const period of sorted) {
          if (!period.endDate) continue;
          const start = safeParseIsoDate(period.startDate);
          const end = safeParseIsoDate(period.endDate);
          if (!start || !end) continue;
          const ms = end.getTime() - start.getTime();
          const days = Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
          if (days > 0) periodLengths.push(days);
        }

        const avg = (arr: number[]) =>
          arr.length === 0 ? undefined : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

        const now = new Date();
        const cutoff = addDays(now, -30);

        const last30MoodCounts: Partial<Record<MoodKey, number>> = {};
        for (const [date, mood] of Object.entries(moodsByDate)) {
          if (!mood) continue;
          const d = safeParseIsoDate(date);
          if (!d || d < cutoff) continue;
          last30MoodCounts[mood] = (last30MoodCounts[mood] ?? 0) + 1;
        }

        const symptomCounts: Record<string, number> = {};
        const symptomMoodCounts: Record<string, Partial<Record<MoodKey, number>>> = {};
        for (const entry of symptoms) {
          const d = safeParseIsoDate(entry.date);
          if (!d || d < cutoff) continue;
          for (const key of entry.symptoms) {
            symptomCounts[key] = (symptomCounts[key] ?? 0) + 1;
            if (entry.mood) {
              symptomMoodCounts[key] = symptomMoodCounts[key] ?? {};
              symptomMoodCounts[key][entry.mood] = (symptomMoodCounts[key][entry.mood] ?? 0) + 1;
            }
          }
        }

        const last30TopSymptoms = Object.entries(symptomCounts)
          .map(([key, count]) => ({ key, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

        const avgCycleDays = avg(cycleDiffs);
        const recentStart = mostRecentPeriodStart(periods);
        const nextPeriodDate =
          avgCycleDays && recentStart
            ? (() => {
                const start = safeParseIsoDate(recentStart);
                if (!start) return undefined;
                const next = addDays(start, avgCycleDays);
                return next.toISOString().slice(0, 10);
              })()
            : undefined;

        let hint: string | undefined;
        const topSymptom = last30TopSymptoms[0];
        if (topSymptom) {
          const moods = symptomMoodCounts[topSymptom.key] ?? {};
          const mostCommon = Object.entries(moods)
            .map(([k, v]) => ({ k: k as MoodKey, v: v ?? 0 }))
            .sort((a, b) => b.v - a.v)[0];
          if (mostCommon && mostCommon.v > 0) {
            hint = `${topSymptom.key} → ${mostCommon.k}`;
          }
        }

        setStats({
          hasEnoughData: cycleDiffs.length >= 1,
          averageCycleDays: avgCycleDays,
          averagePeriodDays: avg(periodLengths),
          periodsCount: periods.length,
          nextPeriodDate,
          last30MoodCounts,
          last30TopSymptoms,
          hint,
        });
      })();
    }, []),
  );

  const subtitle = useMemo(() => {
    if (stats.periodsCount === 0) return t('insights.noData');
    if (!stats.hasEnoughData) return t('insights.notEnoughData');
    return t('insights.subtitle');
  }, [stats.hasEnoughData, stats.periodsCount, t]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('insights.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>

      {stats.hasEnoughData ? (
        <View style={[styles.card, { borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('insights.cycle')}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {stats.averageCycleDays ?? '—'} {t('insights.days')}
          </Text>

          <Text style={[styles.cardTitle, { color: theme.colors.text, marginTop: 12 }]}>
            {t('insights.period')}
          </Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {stats.averagePeriodDays ?? '—'} {t('insights.days')}
          </Text>
        </View>
      ) : null}

      <View style={[styles.card, { borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('insights.predictions')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}
        >
          {stats.nextPeriodDate
            ? t('insights.nextPeriodOn', { date: stats.nextPeriodDate })
            : t('insights.nextPeriodUnknown')}
        </Text>
      </View>

      <View style={[styles.card, { borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('insights.last30Days')}</Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('insights.moodBreakdown')}</Text>
        {(() => {
          const counts = MOODS.map((m) => ({ mood: m, count: stats.last30MoodCounts[m] ?? 0 }));
          const max = Math.max(1, ...counts.map((c) => c.count));
          return counts.map(({ mood, count }) => (
            <View key={mood} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                {t(`moods.${mood}`)}
              </Text>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    { backgroundColor: theme.colors.primary, flex: count },
                  ]}
                />
                <View style={{ flex: max - count }} />
              </View>
              <Text style={[styles.barCount, { color: theme.colors.textSecondary }]}>{count}</Text>
            </View>
          ));
        })()}

        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 12 }]}>
          {t('insights.topSymptoms')}
        </Text>
        {stats.last30TopSymptoms.length === 0 ? (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('insights.noSymptomData')}</Text>
        ) : (
          stats.last30TopSymptoms.map((s) => (
            <Text key={s.key} style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t(`symptoms.${s.key}`)}: {s.count}
            </Text>
          ))
        )}

        {stats.hint ? (
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            {t('insights.hintPrefix')} {(() => {
              const [symptomKey, moodKey] = stats.hint.split(' → ');
              return `${t(`symptoms.${symptomKey}`)} → ${t(`moods.${moodKey}`)}`;
            })()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  barLabel: {
    width: 110,
    fontSize: 12,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: {
    height: 8,
  },
  barCount: {
    width: 28,
    textAlign: 'right',
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
});
