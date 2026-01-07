import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { articles, faqs, cycleTips } from '../data/educationData';
import { ArticleCategory } from '../types/education';

type LearnScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabKey = 'articles' | 'tips' | 'faqs';

export default function LearnScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<LearnScreenNavigationProp>();

  const [selectedTab, setSelectedTab] = useState<TabKey>('articles');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('menstrual-health');

  const tabs: TabKey[] = useMemo(() => ['articles', 'tips', 'faqs'], []);
  const categories: ArticleCategory[] = useMemo(
    () => ['menstrual-health', 'fertility', 'symptoms', 'lifestyle', 'faq'],
    [],
  );

  const filteredArticles = articles.filter((article) =>
    selectedTab === 'faqs' ? article.category === selectedCategory || selectedCategory === 'faq' : article.category === selectedCategory,
  );

  const filteredFAQs = faqs.filter((faq) => selectedCategory === 'faq' || faq.category === selectedCategory);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('learn.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>{t('learn.subtitle')}</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => {
            const selected = tab === selectedTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: selected ? theme.colors.primary : 'transparent',
                    borderBottomWidth: selected ? 0 : 2,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: selected ? theme.colors.background : theme.colors.textSecondary,
                      fontWeight: selected ? '700' : '500',
                    },
                  ]}
                >
                  {t(`learn.tabs.${tab}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Selector (for articles and FAQs) */}
        {(selectedTab === 'articles' || selectedTab === 'faqs') && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
              {t('learn.selectCategory')}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categories.map((category) => {
                const selected = category === selectedCategory;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
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
                      {t(`learn.categories.${category}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Content Display */}
        {selectedTab === 'articles' && (
          <View style={styles.list}>
            {filteredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id })}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  theme.shadows.sm,
                ]}
                accessibilityRole="button"
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{article.title}</Text>
                    <Text style={[styles.cardSummary, { color: theme.colors.textSecondary }]}>
                      {article.summary}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.cardFooter}>
                  <Text style={[styles.readTime, { color: theme.colors.textSecondary }]}>
                    <Ionicons name="time-outline" size={14} /> {article.readTimeMinutes} {t('learn.minRead')}
                  </Text>
                  {article.mediaType === 'video' && (
                    <View style={[styles.videoBadge, { backgroundColor: theme.colors.primaryLight }]}>
                      <Ionicons name="play-circle" size={14} color={theme.colors.primary} />
                      <Text style={[styles.videoBadgeText, { color: theme.colors.primary }]}>
                        {t('learn.video')}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedTab === 'tips' && (
          <View style={styles.list}>
            {cycleTips.map((tip, index) => (
              <View
                key={`${tip.phase}-${index}`}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  theme.shadows.sm,
                ]}
              >
                <View style={styles.tipHeader}>
                  <Ionicons
                    name={tip.icon as keyof typeof Ionicons.glyphMap}
                    size={32}
                    color={theme.colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.phaseLabel, { color: theme.colors.primary }]}>
                      {t(`learn.phases.${tip.phase}`)}
                    </Text>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{tip.title}</Text>
                  </View>
                </View>
                <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>
                  {tip.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'faqs' && (
          <View style={styles.list}>
            {filteredFAQs.map((faq) => (
              <View
                key={faq.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                  theme.shadows.sm,
                ]}
              >
                <View style={styles.faqHeader}>
                  <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
                  <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{faq.question}</Text>
                </View>
                <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    gap: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSummary: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  readTime: {
    fontSize: 12,
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  faqAnswer: {
    marginTop: 10,
    marginLeft: 34,
    fontSize: 14,
    lineHeight: 20,
  },
});
