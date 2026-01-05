import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { listPeriods } from '../services/tracking';
import { safeParseIsoDate } from '../utils/dates';
import { useFocusEffect } from '@react-navigation/native';

type PeriodStats = {
  hasEnoughData: boolean;
  averageCycleDays?: number;
  averagePeriodDays?: number;
  periodsCount: number;
};

export default function InsightsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [stats, setStats] = React.useState<PeriodStats>({
    hasEnoughData: false,
    periodsCount: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const periods = await listPeriods();
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

        setStats({
          hasEnoughData: cycleDiffs.length >= 1,
          averageCycleDays: avg(cycleDiffs),
          averagePeriodDays: avg(periodLengths),
          periodsCount: periods.length,
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
