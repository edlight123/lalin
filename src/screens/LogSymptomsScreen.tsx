import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../contexts/ThemeContext';
import type { IsoDateString, MoodKey } from '../types/tracking';
import { addSymptoms } from '../services/tracking';

const symptomKeys = [
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'acne',
  'breastTenderness',
  'backPain',
  'nausea',
] as const;

const moodKeys = ['happy', 'sad', 'anxious', 'irritable', 'calm', 'energetic', 'tired'] as const satisfies readonly MoodKey[];

export default function LogSymptomsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const [date, setDate] = useState<IsoDateString | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<MoodKey | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const markedDates = useMemo(() => {
    if (!date) return {};
    return {
      [date]: {
        selected: true,
        selectedColor: theme.colors.primary,
      },
    };
  }, [date, theme.colors.primary]);

  const toggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  };

  const save = async () => {
    if (!date) {
      Alert.alert(t('tracking.logSymptoms'), t('tracking.tapToSelect'));
      return;
    }

    await addSymptoms({
      date,
      symptoms: selectedSymptoms,
      mood,
      notes: notes.trim() ? notes.trim() : undefined,
    });

    Alert.alert(t('tracking.saved'));
    navigation.goBack();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
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
          selectedDayTextColor: '#FFFFFF',
        }}
      />

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('tracking.symptoms')}
        </Text>
        <View style={styles.grid}>
          {symptomKeys.map((key) => {
            const selected = selectedSymptoms.includes(key);
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
                onPress={() => toggleSymptom(key)}
              >
                <Text style={{ color: selected ? '#FFFFFF' : theme.colors.text }}>
                  {t(`symptoms.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('tracking.mood')}</Text>
        <View style={styles.grid}>
          {moodKeys.map((key) => {
            const selected = mood === key;
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
                onPress={() => setMood(selected ? undefined : key)}
              >
                <Text style={{ color: selected ? '#FFFFFF' : theme.colors.text }}>
                  {t(`moods.${key}`)}
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
        <Text style={styles.saveText}>{t('common.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
