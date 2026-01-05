import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { getMoodForDate, listPeriods, setMoodForDate } from '../services/tracking';
import { safeParseIsoDate, toIsoDateString } from '../utils/dates';
import type { MoodKey } from '../types/tracking';

type PhaseKey = 'unknown' | 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const [phase, setPhase] = useState<PhaseKey>('unknown');
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState<number | null>(null);
  const [todayMood, setTodayMood] = useState<MoodKey | undefined>(undefined);

  const refresh = useCallback(() => {
    (async () => {
      const today = toIsoDateString(new Date());
      const savedMood = await getMoodForDate(today);
      setTodayMood(savedMood);

      const periods = await listPeriods();
      const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));

      const starts = sorted
        .map((p) => safeParseIsoDate(p.startDate))
        .filter((d): d is Date => Boolean(d));

      if (starts.length < 2) {
        setPhase('unknown');
        setDaysUntilNextPeriod(null);
        return;
      }

      const cycleDiffs: number[] = [];
      for (let i = 1; i < starts.length; i += 1) {
        const diff = differenceInCalendarDays(starts[i], starts[i - 1]);
        if (diff > 0) cycleDiffs.push(diff);
      }

      if (cycleDiffs.length === 0) {
        setPhase('unknown');
        setDaysUntilNextPeriod(null);
        return;
      }

      const avgCycleDays = Math.max(
        1,
        Math.round(cycleDiffs.reduce((a, b) => a + b, 0) / cycleDiffs.length),
      );

      const lastStart = starts[starts.length - 1];
      const predictedNext = addDays(lastStart, avgCycleDays);
      const todayDate = new Date();
      setDaysUntilNextPeriod(differenceInCalendarDays(predictedNext, todayDate));

      const dayOfCycle = differenceInCalendarDays(todayDate, lastStart) + 1;
      const estimatedPeriodLength = 5;
      const ovulationDay = Math.max(1, avgCycleDays - 14);

      if (dayOfCycle <= 0) {
        setPhase('unknown');
      } else if (dayOfCycle <= estimatedPeriodLength) {
        setPhase('menstrual');
      } else if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
        setPhase('ovulation');
      } else if (dayOfCycle < ovulationDay - 1) {
        setPhase('follicular');
      } else if (dayOfCycle <= avgCycleDays) {
        setPhase('luteal');
      } else {
        setPhase('unknown');
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const nextPeriodText = useMemo(() => {
    if (daysUntilNextPeriod === null) return t('home.nextPeriodUnknown');
    if (daysUntilNextPeriod <= 0) return t('home.nextPeriodToday');
    return t('home.daysUntil', { count: daysUntilNextPeriod });
  }, [daysUntilNextPeriod, t]);

  const moods: Array<{ key: MoodKey; emoji: string }> = useMemo(
    () => [
      { key: 'happy', emoji: '😊' },
      { key: 'sad', emoji: '😔' },
      { key: 'anxious', emoji: '😰' },
      { key: 'irritable', emoji: '😡' },
      { key: 'calm', emoji: '😌' },
      { key: 'energetic', emoji: '⚡' },
      { key: 'tired', emoji: '😴' },
    ],
    [],
  );

  const saveMood = useCallback(async (mood: MoodKey) => {
    const today = toIsoDateString(new Date());
    await setMoodForDate(today, mood);
    setTodayMood(mood);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          {t('home.greeting')} 👋
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
          {t('app.tagline')}
        </Text>
      </View>

      {/* Moon Phase Card */}
      <View
        style={[
          styles.card,
          styles.moonCard,
          {
            backgroundColor: theme.colors.primaryLight,
          },
        ]}
      >
        <Text style={styles.moonIcon}>🌙</Text>
        <Text style={[styles.cardTitle, { color: theme.colors.primaryDark }]}>
          {t('home.currentPhase')}
        </Text>
        <Text style={[styles.phaseText, { color: theme.colors.text }]}>
          {t(`phases.${phase}`)}
        </Text>
        <Text style={[styles.nextPeriod, { color: theme.colors.textSecondary }]}>
          {t('home.nextPeriod')} {nextPeriodText}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => navigation.navigate('LogPeriod' as never)}
        >
          <Ionicons name="water" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{t('home.logPeriod')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.accent,
            },
          ]}
          onPress={() => navigation.navigate('LogSymptoms' as never)}
        >
          <Ionicons name="fitness" size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{t('home.logSymptoms')}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Check-in */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('home.todayFeeling')}
        </Text>
        <View style={styles.moodGrid}>
          {moods.map((m) => {
            const selected = todayMood === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.moodButton,
                  {
                    backgroundColor: selected ? theme.colors.primaryLight : theme.colors.secondaryLight,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => saveMood(m.key)}
                accessibilityRole="button"
                accessibilityLabel={t(`moods.${m.key}`)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {todayMood ? (
          <Text style={[styles.moodLabel, { color: theme.colors.textSecondary }]}>
            {t('home.moodToday')}: {t(`moods.${todayMood}`)}
          </Text>
        ) : null}
      </View>

      {/* Learn Section */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📚 {t('learn.title')}
        </Text>
        <TouchableOpacity
          style={styles.learnCard}
          onPress={() => navigation.navigate('Learn' as never)}
        >
          <Text style={[styles.learnTitle, { color: theme.colors.text }]}>
            {t('learn.categories.cycle')}
          </Text>
          <Text style={[styles.learnDesc, { color: theme.colors.textSecondary }]}>
            {t('home.learnCycleDesc')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  moonCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  moonIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  nextPeriod: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    marginTop: 12,
    fontSize: 14,
  },
  learnCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  learnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  learnDesc: {
    fontSize: 14,
  },
});
