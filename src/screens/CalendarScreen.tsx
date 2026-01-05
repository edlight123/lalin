import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { buildPeriodMarkedDates, listPeriods } from '../services/tracking';

export default function CalendarScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [hasData, setHasData] = useState(false);

  const refresh = useCallback(() => {
    (async () => {
      const periods = await listPeriods();
      setHasData(periods.length > 0);
      setMarkedDates(buildPeriodMarkedDates(periods, theme.colors.menstruation));
    })();
  }, [theme.colors.menstruation]);

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
          onPress={() => navigation.navigate('LogPeriod' as never)}
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
});
