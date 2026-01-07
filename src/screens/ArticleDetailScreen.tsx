import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { articles } from '../data/educationData';

type ArticleDetailScreenRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;

type Props = {
  route: ArticleDetailScreenRouteProp;
};

export default function ArticleDetailScreen({ route }: Props) {
  const { articleId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();

  const article = articles.find((a) => a.id === articleId);

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {t('learn.articleNotFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{article.title}</Text>
          <View style={styles.meta}>
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              <Ionicons name="time-outline" size={14} /> {article.readTimeMinutes} {t('learn.minRead')}
            </Text>
            {article.cyclePhase && (
              <View style={[styles.phaseBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.phaseText, { color: theme.colors.primary }]}>
                  {t(`learn.phases.${article.cyclePhase}`)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            theme.shadows.sm,
          ]}
        >
          <Text style={[styles.contentText, { color: theme.colors.text }]}>{article.content}</Text>
        </View>

        {article.tags.length > 0 && (
          <View style={styles.tags}>
            {article.tags.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.disclaimer,
            {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.disclaimerText, { color: theme.colors.primaryDark }]}>
            {t('learn.medicalDisclaimer')}
          </Text>
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
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaText: {
    fontSize: 13,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
