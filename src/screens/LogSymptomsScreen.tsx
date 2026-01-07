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
import type { IsoDateString, MoodKey, SymptomItem, SymptomSeverity } from '../types/tracking';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { addSymptoms, getSymptomById, updateSymptoms } from '../services/tracking';
import Slider from '@react-native-community/slider';

type LogSymptomsRoute = RouteProp<RootStackParamList, 'LogSymptoms'>;
type LogSymptomsNav = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<LogSymptomsNav>();
  const route = useRoute<LogSymptomsRoute>();

  const symptomId = route.params?.symptomId;

  const [date, setDate] = useState<IsoDateString | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomItem[]>([]);
  const [mood, setMood] = useState<MoodKey | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');

  useEffect(() => {
    if (!symptomId) return;
    let mounted = true;
    (async () => {
      const existing = await getSymptomById(symptomId);
      if (!existing || !mounted) return;
      setDate(existing.date);
      setSelectedSymptoms(existing.symptoms ?? []);
      setMedications(existing.medications ?? []);
      setMood(existing.mood);
      setNotes(existing.notes ?? '');
    })();
    return () => {
      mounted = false;
    };
  }, [symptomId]);

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
    setSelectedSymptoms((prev) => {
      const idx = prev.findIndex((s) => s.key === key && !s.custom);
      if (idx !== -1) {
        // Remove
        return prev.filter((_, i) => i !== idx);
      } else {
        // Add with default severity 1
        return [...prev, { key, severity: 1 }];
      }
    });
  };

  const setSymptomSeverity = (key: string, severity: SymptomSeverity, custom = false) => {
    setSelectedSymptoms((prev) =>
      prev.map((s) =>
        s.key === key && (custom ? s.custom : !s.custom) ? { ...s, severity } : s
      )
    );
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptomInput.trim();
    if (!trimmed) return;
    if (selectedSymptoms.some((s) => s.custom && s.key.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert(t('tracking.customSymptomExists'));
      return;
    }
    setSelectedSymptoms((prev) => [...prev, { key: trimmed, custom: true, severity: 1 }]);
    setCustomSymptomInput('');
  };

  const removeCustomSymptom = (key: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => !(s.custom && s.key === key)));
  };

  const addMedication = () => {
    const trimmed = medicationInput.trim();
    if (!trimmed) return;
    if (medications.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert(t('tracking.medicationExists'));
      return;
    }
    setMedications((prev) => [...prev, trimmed]);
    setMedicationInput('');
  };

  const removeMedication = (med: string) => {
    setMedications((prev) => prev.filter((m) => m !== med));
  };

  const save = async () => {
    if (!date) {
      Alert.alert(t('tracking.logSymptoms'), t('tracking.tapToSelect'));
      return;
    }

    const payload = {
      date,
      symptoms: selectedSymptoms,
      medications: medications.length > 0 ? medications : undefined,
      mood,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    if (symptomId) {
      await updateSymptoms(symptomId, payload);
    } else {
      await addSymptoms(payload);
    }

    Alert.alert(t('tracking.saved'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
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
          {t('tracking.symptoms')}
        </Text>
        <View style={styles.grid}>
          {symptomKeys.map((key) => {
            const item = selectedSymptoms.find((s) => s.key === key && !s.custom);
            const selected = !!item;
            return (
              <View key={key} style={{ alignItems: 'center', marginRight: 8, marginBottom: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleSymptom(key)}
                >
                  <Text style={{ color: selected ? theme.colors.background : theme.colors.text }}>
                    {t(`symptoms.${key}`)}
                  </Text>
                </TouchableOpacity>
                {selected && (
                  <View style={{ width: 80 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>{t('tracking.severity')}</Text>
                    <Slider
                      value={item.severity}
                      onValueChange={(v: number) => setSymptomSeverity(key, v as SymptomSeverity)}
                      minimumValue={0}
                      maximumValue={3}
                      step={1}
                      minimumTrackTintColor={theme.colors.primary}
                      maximumTrackTintColor={theme.colors.border}
                      thumbTintColor={theme.colors.primary}
                    />
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>{item.severity}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('tracking.customSymptoms')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={customSymptomInput}
            onChangeText={setCustomSymptomInput}
            placeholder={t('tracking.addCustomSymptomPlaceholder')}
            placeholderTextColor={theme.colors.textLight}
            style={[styles.input, { flex: 1, minHeight: 44, borderColor: theme.colors.border, color: theme.colors.text }]}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addCustomSymptom}
          >
            <Text style={{ color: theme.colors.background, fontWeight: '600' }}>+</Text>
          </TouchableOpacity>
        </View>
        {selectedSymptoms.filter((s) => s.custom).length > 0 && (
          <View style={styles.grid}>
            {selectedSymptoms.filter((s) => s.custom).map((item) => (
              <View key={item.key} style={{ alignItems: 'center', marginRight: 8, marginBottom: 8 }}>
                <View style={[styles.chip, { backgroundColor: theme.colors.primary, borderColor: theme.colors.border, flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
                  <Text style={{ color: theme.colors.background }}>{item.key}</Text>
                  <TouchableOpacity onPress={() => removeCustomSymptom(item.key)}>
                    <Text style={{ color: theme.colors.background, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ width: 80 }}>
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>{t('tracking.severity')}</Text>
                  <Slider
                    value={item.severity}
                    onValueChange={(v: number) => setSymptomSeverity(item.key, v as SymptomSeverity, true)}
                    minimumValue={0}
                    maximumValue={3}
                    step={1}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.border}
                    thumbTintColor={theme.colors.primary}
                  />
                  <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>{item.severity}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.text }]}>{t('tracking.medications')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={medicationInput}
            onChangeText={setMedicationInput}
            placeholder={t('tracking.addMedicationPlaceholder')}
            placeholderTextColor={theme.colors.textLight}
            style={[styles.input, { flex: 1, minHeight: 44, borderColor: theme.colors.border, color: theme.colors.text }]}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addMedication}
          >
            <Text style={{ color: theme.colors.background, fontWeight: '600' }}>+</Text>
          </TouchableOpacity>
        </View>
        {medications.length > 0 && (
          <View style={styles.grid}>
            {medications.map((med) => (
              <View key={med} style={[styles.chip, { backgroundColor: theme.colors.accent, borderColor: theme.colors.border, flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
                <Text style={{ color: theme.colors.background }}>{med}</Text>
                <TouchableOpacity onPress={() => removeMedication(med)}>
                  <Text style={{ color: theme.colors.background, fontWeight: 'bold' }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
                <Text style={{ color: selected ? theme.colors.background : theme.colors.text }}>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
