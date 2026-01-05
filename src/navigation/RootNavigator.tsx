import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import InsightsScreen from '../screens/InsightsScreen';
import LearnScreen from '../screens/LearnScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LogPeriodScreen from '../screens/LogPeriodScreen';
import LogSymptomsScreen from '../screens/LogSymptomsScreen';

import { colors } from '../constants/theme';
import { getOnboardingDone } from '../services/tracking';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  LogPeriod: { periodId?: string } | undefined;
  LogSymptoms: { symptomId?: string } | undefined;
};

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Insights: undefined;
  Learn: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: t('navigation.calendar'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: t('navigation.insights'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          title: t('navigation.learn'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const done = await getOnboardingDone();
      if (mounted) {
        setHasCompletedOnboarding(done);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Stack.Navigator>
      {!hasCompletedOnboarding ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : null}

      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="LogPeriod"
        component={LogPeriodScreen}
        options={{
          headerShown: true,
          title: ' ',
          headerTintColor: colors.primary,
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="LogSymptoms"
        component={LogSymptomsScreen}
        options={{
          headerShown: true,
          title: ' ',
          headerTintColor: colors.primary,
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
