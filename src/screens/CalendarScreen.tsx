import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { useTranslation } from 'react-i18next';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import type { RootStackParamList, TabParamList } from '../navigation/RootNavigator';
import type { PeriodEntry } from '../types/tracking';
import { buildPeriodMarkedDates, deletePeriod, listPeriods } from '../services/tracking';

type CalendarNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Calendar'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function CalendarScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<CalendarNavigationProp>();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [hasData, setHasData] = useState(false);
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);

  const refresh = useCallback(() => {
    (async () => {
      const fetchedPeriods = await listPeriods();
      const sorted = [...fetchedPeriods].sort((a, b) => b.startDate.localeCompare(a.startDate));
      setHasData(fetchedPeriods.length > 0);
      setPeriods(sorted);
      setMarkedDates(buildPeriodMarkedDates(fetchedPeriods, theme.colors.menstruation));
    })();
  }, [theme.colors.menstruation]);

  const confirmDelete = useCallback(
    (period: PeriodEntry) => {
      Alert.alert(
        t('calendar.deleteTitle'),
        t('calendar.deleteMessage', {
          startDate: period.startDate,
          endDate: period.endDate ?? period.startDate,
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              await deletePeriod(period.id);
              refresh();
            },
          },
        ],
      );
    },
    [refresh, t],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('calendar.title')}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('LogPeriod')}
        >
          <Text style={styles.buttonText}>{t('calendar.addPeriod')}</Text>
        </TouchableOpacity>
      </View>

      {!hasData ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('calendar.noData')}
        </Text>
      ) : null}

      <Calendar
        markedDates={markedDates}
        theme={{
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.menstruation,
          selectedDayTextColor: '#FFFFFF',
        }}
      />

      {hasData ? (
        <View style={[styles.historyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
            {t('calendar.history')}
          </Text>

          {periods.slice(0, 10).map((p) => (
            <View key={p.id} style={[styles.historyRow, { borderBottomColor: theme.colors.border }]}
            >
              <View style={styles.historyLeft}>
                <Text style={[styles.historyDates, { color: theme.colors.text }]}>
                  {p.startDate}{p.endDate ? ` → ${p.endDate}` : ''}
                </Text>
                <Text style={[styles.historyMeta, { color: theme.colors.textSecondary }]}>
                  {p.flow ? t(`tracking.flow${p.flow[0].toUpperCase()}${p.flow.slice(1)}`) : '—'}
                </Text>
              </View>

              <View style={styles.historyActions}>
                <TouchableOpacity
                  style={[styles.actionPill, { borderColor: theme.colors.border }]}
                  onPress={() => navigation.navigate('LogPeriod', { periodId: p.id })}
                >
                  <Text style={{ color: theme.colors.text }}>{t('common.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionPill, { borderColor: theme.colors.border }]}
                  onPress={() => confirmDelete(p)}
                >
                  <Text style={{ color: theme.colors.error }}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyLeft: {
    flex: 1,
    gap: 4,
  },
  historyDates: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyMeta: {
    fontSize: 12,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
