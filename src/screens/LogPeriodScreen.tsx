import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../contexts/ThemeContext';
import type { FlowLevel, IsoDateString } from '../types/tracking';
import { addPeriod, getPeriodById, updatePeriod } from '../services/tracking';
import { reschedulePeriodReminder } from '../services/notifications';

type RouteParams = {
  periodId?: string;
};

export default function LogPeriodScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const periodId = (route.params as RouteParams | undefined)?.periodId;

  const [startDate, setStartDate] = useState<IsoDateString | null>(null);
  const [endDate, setEndDate] = useState<IsoDateString | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!periodId) return;
    let mounted = true;
    (async () => {
      const existing = await getPeriodById(periodId);
      if (!existing || !mounted) return;
      setStartDate(existing.startDate);
      setEndDate(existing.endDate ?? null);
      setFlow(existing.flow ?? 'medium');
      setNotes(existing.notes ?? '');
    })();
    return () => {
      mounted = false;
    };
  }, [periodId]);

  const markedDates = useMemo(() => {
    const marked: MarkedDates = {};
    if (startDate) {
      marked[startDate] = {
        selected: true,
        selectedColor: theme.colors.menstruation,
      };
    }
    if (endDate) {
      marked[endDate] = {
        selected: true,
        selectedColor: theme.colors.menstruation,
      };
    }
    return marked;
  }, [startDate, endDate, theme.colors.menstruation]);

  const onDayPress = (day: { dateString: string }) => {
    const selected = day.dateString as IsoDateString;

    if (!startDate || !selectingEnd) {
      setStartDate(selected);
      setEndDate(null);
      return;
    }

    // selecting end date
    if (selected < startDate) {
      // swap if user picked an earlier date
      setEndDate(startDate);
      setStartDate(selected);
      return;
    }

    setEndDate(selected);
  };

  const save = async () => {
    if (!startDate) {
      Alert.alert(t('tracking.logPeriod'), t('tracking.tapToSelect'));
      return;
    }

    const payload = {
      startDate,
      endDate: endDate ?? undefined,
      flow,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    if (periodId) {
      await updatePeriod(periodId, payload);
    } else {
      await addPeriod(payload);
    }

    await reschedulePeriodReminder({
      title: t('app.name'),
      body: t('profile.periodReminderBody'),
    });

    Alert.alert(t('tracking.saved'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
        {t('tracking.tapToSelect')}
      </Text>

      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.menstruation,
          selectedDayTextColor: theme.colors.background,
        }}
      />

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('tracking.startDate')}: {startDate ?? '—'}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('tracking.endDateOptional')}: {endDate ?? '—'}
          </Text>
          <TouchableOpacity
            style={[styles.smallButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              if (endDate) {
                setEndDate(null);
                setSelectingEnd(false);
              } else {
                setSelectingEnd((v) => !v);
              }
            }}
          >
            <Text style={{ color: theme.colors.text }}>
              {endDate ? t('tracking.clearEndDate') : t('tracking.chooseEndDate')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('tracking.flow')}</Text>
        <View style={styles.flowRow}>
          {([
            { key: 'light', label: t('tracking.flowLight') },
            { key: 'medium', label: t('tracking.flowMedium') },
            { key: 'heavy', label: t('tracking.flowHeavy') },
          ] as const).map((item) => {
            const selected = flow === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setFlow(item.key)}
              >
                <Text style={{ color: selected ? theme.colors.background : theme.colors.text }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('tracking.notes')}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={t('tracking.notes')}
          placeholderTextColor={theme.colors.textLight}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
        onPress={save}
      >
        <Text style={[styles.saveText, { color: theme.colors.background }]}>{t('common.save')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  helper: {
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  flowRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 'auto',
  },
  saveText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
