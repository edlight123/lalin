import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { setOnboardingDone } from '../services/tracking';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      icon: '🌙',
      title: t('onboarding.welcome'),
      subtitle: t('onboarding.subtitle'),
    },
    {
      icon: '📅',
      title: t('onboarding.step1Title'),
      subtitle: t('onboarding.step1Desc'),
    },
    {
      icon: '📊',
      title: t('onboarding.step2Title'),
      subtitle: t('onboarding.step2Desc'),
    },
    {
      icon: '📚',
      title: t('onboarding.step3Title'),
      subtitle: t('onboarding.step3Desc'),
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      scrollRef.current?.scrollTo({ x: width * nextPage, animated: true });
      setCurrentPage(nextPage);
    } else {
      setOnboardingDone(true);
      navigation.navigate('MainTabs' as never);
    }
  };

  const handleSkip = () => {
    setOnboardingDone(true);
    navigation.navigate('MainTabs' as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.secondary }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPage(page);
        }}
      >
        {pages.map((page, index) => (
          <View key={index} style={[styles.page, { width }]}>
            <Text style={styles.icon}>{page.icon}</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {page.title}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {page.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentPage
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {currentPage < pages.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
                {t('common.skip')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentPage === pages.length - 1
                ? t('onboarding.getStarted')
                : t('common.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 100,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
