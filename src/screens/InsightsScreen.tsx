import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { addDays } from 'date-fns';
import type { MoodKey } from '../types/tracking';
import { listMoodsByDate, listPeriods, listSymptoms } from '../services/tracking';
import { safeParseIsoDate } from '../utils/dates';
import { useFocusEffect } from '@react-navigation/native';
import { computeCycleStats, computePredictions } from '../services/predictions';

type PeriodStats = {
  hasEnoughData: boolean;
  periodsCount: number;
  cycleDays?: number;
  cycleRangeDays?: { min: number; max: number };
  periodDays?: number;
  nextPeriodRange?: { start: string; end: string };
  last30MoodCounts: Partial<Record<MoodKey, number>>;
  last30TopSymptoms: Array<{ key: string; count: number }>;
  hint?: string;
  irregularityAlert?: string;
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

  const [showPredictionExplanation, setShowPredictionExplanation] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const periods = await listPeriods();
        const symptoms = await listSymptoms();
        const moodsByDate = await listMoodsByDate();

        const cycleStats = computeCycleStats(periods);
        const predictions = computePredictions(periods);

        // Detect irregularity: if last cycle differs significantly from average
        let irregularityAlert: string | undefined;
        if (periods.length >= 3) {
          const cycleLengths = [];
          for (let i = 0; i < periods.length - 1; i++) {
            const curr = periods[i];
            const next = periods[i + 1];
            const start1 = safeParseIsoDate(curr.startDate);
            const start2 = safeParseIsoDate(next.startDate);
            if (start1 && start2) {
              const diff = Math.round((start1.getTime() - start2.getTime()) / (1000 * 60 * 60 * 24));
              if (diff > 0) cycleLengths.push(diff);
            }
          }
          if (cycleLengths.length >= 2) {
            const avg = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
            const lastCycle = cycleLengths[0];
            const deviation = Math.abs(lastCycle - avg);
            if (deviation > 7) {
              irregularityAlert = t('insights.irregularityDetected', { lastCycle, avg: Math.round(avg) });
            }
          }
        }

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
          for (const item of entry.symptoms) {
            const key = item.key;
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
          hasEnoughData: cycleStats.hasEnoughData,
          periodsCount: periods.length,
          cycleDays: cycleStats.cycleLengthDays,
          cycleRangeDays: cycleStats.cycleLengthRangeDays,
          periodDays: cycleStats.periodLengthDays,
          nextPeriodRange: predictions.nextPeriod ? predictions.nextPeriod.range : undefined,
          last30MoodCounts,
          last30TopSymptoms,
          hint,
          irregularityAlert,
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('insights.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>

      {stats.hasEnoughData ? (
        <View style={[styles.card, { borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('insights.cycle')}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {stats.cycleDays ?? '—'} {t('insights.days')}
          </Text>
          {stats.cycleRangeDays ? (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}> 
              {t('insights.cycleRange', { min: stats.cycleRangeDays.min, max: stats.cycleRangeDays.max })}
            </Text>
          ) : null}

          <Text style={[styles.cardTitle, { color: theme.colors.text, marginTop: 12 }]}>
            {t('insights.period')}
          </Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {stats.periodDays ?? '—'} {t('insights.days')}
          </Text>
        </View>
      ) : null}

      <View style={[styles.card, { borderColor: theme.colors.border }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t('insights.predictions')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}
        >
          {stats.nextPeriodRange
            ? t('insights.nextPeriodRange', { start: stats.nextPeriodRange.start, end: stats.nextPeriodRange.end })
            : t('insights.nextPeriodUnknown')}
        </Text>

        {stats.hasEnoughData ? (
          <TouchableOpacity
            style={[styles.explanationToggle, { marginTop: 12 }]}
            onPress={() => setShowPredictionExplanation(!showPredictionExplanation)}
          >
            <Text style={[styles.explanationToggleText, { color: theme.colors.primary }]}>
              {showPredictionExplanation ? t('insights.hideExplanation') : t('insights.showExplanation')}
            </Text>
          </TouchableOpacity>
        ) : null}

        {showPredictionExplanation && stats.hasEnoughData ? (
          <View style={[styles.explanationBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginTop: 8 }]}>
            <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
              {t('insights.howPredictionsWork')}
            </Text>
            <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
              {t('insights.predictionExplanation', { count: stats.periodsCount })}
            </Text>
            <Text style={[styles.explanationText, { color: theme.colors.textSecondary, marginTop: 8 }]}>
              {t('insights.whyPredictionsChange')}
            </Text>
          </View>
        ) : null}
      </View>

      {stats.irregularityAlert ? (
        <View style={[styles.card, styles.alertCard, { borderColor: theme.colors.warning, backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.alertText, { color: theme.colors.warning }]}>⚠ {stats.irregularityAlert}</Text>
        </View>
      ) : null}

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
    </SafeAreaView>
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
  alertCard: {
    borderWidth: 2,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
  },
  explanationToggle: {
    alignSelf: 'flex-start',
  },
  explanationToggleText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  explanationBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
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
