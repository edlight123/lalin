import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

type CategoryKey = 'cycle' | 'health' | 'fertility' | 'wellness';
type ArticleKey = 'cycleBasics' | 'trackingTips' | 'commonSymptoms' | 'whenToSeekCare' | 'fertileWindow' | 'contraception' | 'sleepStress' | 'nutritionHydration';

export default function LearnScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('cycle');

  const categories: CategoryKey[] = useMemo(() => ['cycle', 'health', 'fertility', 'wellness'], []);

  const articlesByCategory: Record<CategoryKey, ArticleKey[]> = useMemo(
    () => ({
      cycle: ['cycleBasics', 'trackingTips'],
      health: ['commonSymptoms', 'whenToSeekCare'],
      fertility: ['fertileWindow', 'contraception'],
      wellness: ['sleepStress', 'nutritionHydration'],
    }),
    [],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('learn.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('learn.disclaimer')}
      </Text>

      <View style={styles.categoryRow}>
        {categories.map((key) => {
          const selected = key === selectedCategory;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCategory(key)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              accessibilityRole="button"
            >
              <Text style={{ color: selected ? '#FFFFFF' : theme.colors.text, fontWeight: '700' }}>
                {t(`learn.categories.${key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.list}>
        {articlesByCategory[selectedCategory].map((articleKey) => (
          <View
            key={articleKey}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t(`learn.articles.${articleKey}.title`)}
            </Text>
            <Text style={[styles.cardBody, { color: theme.colors.textSecondary }]}>
              {t(`learn.articles.${articleKey}.body`)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  list: {
    gap: 10,
    marginTop: 6,
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
});
