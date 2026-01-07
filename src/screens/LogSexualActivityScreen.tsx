import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../contexts/ThemeContext';
import type { IsoDateString, ProtectionStatus } from '../types/tracking';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { addSexualActivity, getSexualActivityById, updateSexualActivity } from '../services/tracking';

type LogSexualActivityRoute = RouteProp<RootStackParamList, 'LogSexualActivity'>;
type LogSexualActivityNav = NativeStackNavigationProp<RootStackParamList>;

const protectionOptions: ProtectionStatus[] = ['protected', 'unprotected', 'none'];

export default function LogSexualActivityScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LogSexualActivityNav>();
  const route = useRoute<LogSexualActivityRoute>();

  const activityId = route.params?.activityId;

  const [date, setDate] = useState<IsoDateString | null>(null);
  const [protection, setProtection] = useState<ProtectionStatus>('none');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!activityId) return;
    let mounted = true;
    (async () => {
      const existing = await getSexualActivityById(activityId);
      if (!existing || !mounted) return;
      setDate(existing.date);
      setProtection(existing.protection);
      setNotes(existing.notes ?? '');
    })();
    return () => {
      mounted = false;
    };
  }, [activityId]);

  const markedDates = useMemo(() => {
    if (!date) return {};
    return {
      [date]: {
        selected: true,
        selectedColor: theme.colors.primary,
      },
    };
  }, [date, theme.colors.primary]);

  const save = async () => {
    if (!date) {
      Alert.alert(t('tracking.logSexualActivity'), t('tracking.tapToSelect'));
      return;
    }

    const payload = {
      date,
      protection,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    if (activityId) {
      await updateSexualActivity(activityId, payload);
    } else {
      await addSexualActivity(payload);
    }

    Alert.alert(t('tracking.saved'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
          {t('tracking.sexualActivityDisclaimer')}
        </Text>

        <Text style={[styles.helper, { color: theme.colors.textSecondary }]}>
          {t('tracking.tapToSelect')}
        </Text>

        <Calendar
          onDayPress={(d: DateData) => setDate(d.dateString as IsoDateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.background,
          }}
        />

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('tracking.protection')}
          </Text>
          <View style={styles.grid}>
            {protectionOptions.map((key) => {
              const selected = protection === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setProtection(key)}
                >
                  <Text style={{ color: selected ? theme.colors.background : theme.colors.text }}>
                    {t(`protection.${key}`)}
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
            placeholder={t('tracking.notesOptional')}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  disclaimer: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    marginTop: 8,
  },
  saveText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
