import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

type CategoryKey = 'cycle' | 'health' | 'fertility' | 'wellness';
type ArticleKey =
  | 'cycleBasics'
  | 'trackingTips'
  | 'cycleLengthAndIrregularity'
  | 'flowAndPeriodLength'
  | 'spottingAndBleeding'
  | 'commonSymptoms'
  | 'whenToSeekCare'
  | 'dischargeBasics'
  | 'commonConditions'
  | 'stiBasics'
  | 'fertileWindow'
  | 'contraception'
  | 'emergencyContraception'
  | 'tryingToConceive'
  | 'pregnancyBasics'
  | 'sleepStress'
  | 'nutritionHydration'
  | 'movementExercise'
  | 'pmsMood'
  | 'painRelief';

export default function LearnScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('cycle');
  const [expandedArticle, setExpandedArticle] = useState<ArticleKey | null>(null);

  const categories: CategoryKey[] = useMemo(() => ['cycle', 'health', 'fertility', 'wellness'], []);

  const articlesByCategory: Record<CategoryKey, ArticleKey[]> = useMemo(
    () => ({
      cycle: ['cycleBasics', 'trackingTips', 'cycleLengthAndIrregularity', 'flowAndPeriodLength', 'spottingAndBleeding'],
      health: ['commonSymptoms', 'whenToSeekCare', 'dischargeBasics', 'commonConditions', 'stiBasics'],
      fertility: ['fertileWindow', 'contraception', 'emergencyContraception', 'tryingToConceive', 'pregnancyBasics'],
      wellness: ['sleepStress', 'nutritionHydration', 'movementExercise', 'pmsMood', 'painRelief'],
    }),
    [],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.primaryDark }]}>{t('learn.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>{t('learn.disclaimer')}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          {t('learn.selectCategory')}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((key) => {
            const selected = key === selectedCategory;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSelectedCategory(key);
                  setExpandedArticle(null);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    color: selected ? theme.colors.background : theme.colors.text,
                    fontWeight: '700',
                  }}
                >
                  {t(`learn.categories.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {articlesByCategory[selectedCategory].map((articleKey) => {
            const expanded = expandedArticle === articleKey;
            const body = t(`learn.articles.${articleKey}.body`);

            return (
              <View
                key={articleKey}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  theme.shadows.sm,
                ]}
              >
                <TouchableOpacity
                  onPress={() => setExpandedArticle((prev) => (prev === articleKey ? null : articleKey))}
                  accessibilityRole="button"
                >
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {t(`learn.articles.${articleKey}.title`)}
                  </Text>
                  <Text
                    style={[styles.cardBody, { color: theme.colors.textSecondary }]}
                    numberOfLines={expanded ? undefined : 3}
                    ellipsizeMode="tail"
                  >
                    {body}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setExpandedArticle((prev) => (prev === articleKey ? null : articleKey))}
                  accessibilityRole="button"
                  style={styles.readMoreButton}
                >
                  <Text style={[styles.readMoreText, { color: theme.colors.primaryDark }]}>
                    {expanded ? t('learn.readLess') : t('learn.readMore')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
    padding: 16,
    gap: 12,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  list: {
    gap: 10,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
