import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { differenceInCalendarDays } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { getMoodForDate, listPeriods, setMoodForDate } from '../services/tracking';
import { safeParseIsoDate, toIsoDateString } from '../utils/dates';
import { computePredictions } from '../services/predictions';
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
      const todayDate = new Date();

      const predictions = computePredictions(periods, todayDate);
      setDaysUntilNextPeriod(predictions.nextPeriod ? predictions.nextPeriod.daysUntilStart : null);

      const lastStartIso = predictions.stats.lastPeriodStart;
      const lastStart = lastStartIso ? safeParseIsoDate(lastStartIso) : null;
      const cycleDays = predictions.stats.cycleLengthDays;
      const periodLen = predictions.stats.periodLengthDays ?? 5;

      if (!lastStart || !cycleDays) {
        setPhase('unknown');
        return;
      }

      const dayOfCycle = differenceInCalendarDays(todayDate, lastStart) + 1;
      if (dayOfCycle <= 0) {
        setPhase('unknown');
        return;
      }

      if (dayOfCycle <= periodLen) {
        setPhase('menstrual');
        return;
      }

      const ovulationDate = predictions.ovulation?.date
        ? safeParseIsoDate(predictions.ovulation.date)
        : null;
      if (ovulationDate) {
        const delta = Math.abs(differenceInCalendarDays(todayDate, ovulationDate));
        if (delta <= 1) {
          setPhase('ovulation');
          return;
        }

        if (todayDate < ovulationDate) {
          setPhase('follicular');
          return;
        }
      }

      if (dayOfCycle <= cycleDays) {
        setPhase('luteal');
        return;
      }

      setPhase('unknown');
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
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
          <Ionicons name="water" size={24} color={theme.colors.background} />
          <Text style={[styles.actionText, { color: theme.colors.background }]}>{t('home.logPeriod')}</Text>
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
          <Ionicons name="fitness" size={24} color={theme.colors.background} />
          <Text style={[styles.actionText, { color: theme.colors.background }]}>{t('home.logSymptoms')}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Check-in */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
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
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📚 {t('learn.title')}
        </Text>
        <TouchableOpacity
          style={[styles.learnCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
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
    </SafeAreaView>
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
    borderWidth: 1,
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
    borderRadius: 12,
    borderWidth: 1,
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
