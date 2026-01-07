import * as Notifications from 'expo-notifications';

import { getJson, setJson } from './storage';
import { listPeriods } from './tracking';
import { computePredictions } from './predictions';
import { safeParseIsoDate } from '../utils/dates';
import { addDays } from 'date-fns';

type NotificationSettings = {
  dailyReminderEnabled: boolean;
  periodReminderEnabled: boolean;
  fertileWindowEnabled: boolean;
  dailyReminderId?: string;
  periodReminderId?: string;
  fertileWindowReminderId?: string;
  dailyReminderTime?: string; // HH:MM format
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
};

const KEY = 'lalin_notification_settings_v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function getSettings(): Promise<NotificationSettings> {
  return getJson<NotificationSettings>(KEY, {
    dailyReminderEnabled: false,
    periodReminderEnabled: false,
    fertileWindowEnabled: false,
    dailyReminderTime: '09:00',
  });
}

async function setSettings(next: NotificationSettings): Promise<void> {
  await setJson(KEY, next);
}

async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function scheduleOrReschedulePeriodReminder(
  settings: NotificationSettings,
  content: Pick<Notifications.NotificationContentInput, 'title' | 'body'>,
): Promise<NotificationSettings> {
  // Always cancel any existing one-off reminder before re-scheduling.
  if (settings.periodReminderId) {
    await Notifications.cancelScheduledNotificationAsync(settings.periodReminderId);
  }

  const periods = await listPeriods();
  const predictions = computePredictions(periods);
  const rangeStartIso = predictions.nextPeriod?.range.start;
  const rangeStart = rangeStartIso ? safeParseIsoDate(rangeStartIso) : null;

  if (!rangeStart) {
    return {
      ...settings,
      periodReminderEnabled: true,
      periodReminderId: undefined,
    };
  }

  const now = new Date();

  const buildAt9amLocal = (base: Date) => {
    const d = new Date(base);
    d.setHours(9, 0, 0, 0);
    return d;
  };

  // Notify the day before the predicted range starts (best-effort).
  let fireAt = buildAt9amLocal(addDays(rangeStart, -1));
  if (fireAt <= now) {
    fireAt = buildAt9amLocal(rangeStart);
  }

  if (fireAt <= now) {
    // Too late to schedule (e.g., range already passed). Keep enabled but unscheduled.
    return {
      ...settings,
      periodReminderEnabled: true,
      periodReminderId: undefined,
    };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });

  return {
    ...settings,
    periodReminderEnabled: true,
    periodReminderId: id,
  };
}

export async function updateNotificationTime(time: string): Promise<void> {
  const settings = await getSettings();
  const updated = { ...settings, dailyReminderTime: time };
  await setSettings(updated);
  
  // Reschedule if enabled
  if (settings.dailyReminderEnabled) {
    await setDailyReminderEnabled(true, {
      title: 'Daily Check-in',
      body: 'How are you feeling today?',
    });
  }
}

export async function updateQuietHours(start: string | undefined, end: string | undefined): Promise<void> {
  const settings = await getSettings();
  const updated = { ...settings, quietHoursStart: start, quietHoursEnd: end };
  await setSettings(updated);
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return getSettings();
}

export async function setDailyReminderEnabled(
  enabled: boolean,
  content: Pick<Notifications.NotificationContentInput, 'title' | 'body'>,
): Promise<void> {
  const settings = await getSettings();

  if (!enabled) {
    if (settings.dailyReminderId) {
      await Notifications.cancelScheduledNotificationAsync(settings.dailyReminderId);
    }
    await setSettings({
      ...settings,
      dailyReminderEnabled: false,
      dailyReminderId: undefined,
    });
    return;
  }

  const ok = await ensurePermissions();
  if (!ok) {
    await setSettings({ ...settings, dailyReminderEnabled: false, dailyReminderId: undefined });
    return;
  }

  if (settings.dailyReminderId) {
    // already scheduled
    await setSettings({ ...settings, dailyReminderEnabled: true });
    return;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  await setSettings({
    ...settings,
    dailyReminderEnabled: true,
    dailyReminderId: id,
  });
}

export async function setPeriodReminderEnabled(
  enabled: boolean,
  content: Pick<Notifications.NotificationContentInput, 'title' | 'body'>,
): Promise<void> {
  const settings = await getSettings();

  if (!enabled) {
    if (settings.periodReminderId) {
      await Notifications.cancelScheduledNotificationAsync(settings.periodReminderId);
    }
    await setSettings({
      ...settings,
      periodReminderEnabled: false,
      periodReminderId: undefined,
    });
    return;
  }

  const ok = await ensurePermissions();
  if (!ok) {
    await setSettings({ ...settings, periodReminderEnabled: false, periodReminderId: undefined });
    return;
  }

  const next = await scheduleOrReschedulePeriodReminder(settings, content);
  await setSettings(next);
}

async function scheduleFertileWindowReminder(
  settings: NotificationSettings,
  content: Pick<Notifications.NotificationContentInput, 'title' | 'body'>,
): Promise<NotificationSettings> {
  if (settings.fertileWindowReminderId) {
    await Notifications.cancelScheduledNotificationAsync(settings.fertileWindowReminderId);
  }

  const periods = await listPeriods();
  const predictions = computePredictions(periods);
  const fertileStart = predictions.fertileWindow?.start;
  const fertileStartDate = fertileStart ? safeParseIsoDate(fertileStart) : null;

  if (!fertileStartDate) {
    return {
      ...settings,
      fertileWindowEnabled: true,
      fertileWindowReminderId: undefined,
    };
  }

  const now = new Date();
  const [hour, minute] = (settings.dailyReminderTime || '09:00').split(':').map(Number);
  const fireAt = new Date(fertileStartDate);
  fireAt.setHours(hour, minute, 0, 0);

  if (fireAt <= now) {
    return {
      ...settings,
      fertileWindowEnabled: true,
      fertileWindowReminderId: undefined,
    };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });

  return {
    ...settings,
    fertileWindowEnabled: true,
    fertileWindowReminderId: id,
  };
}

export async function setFertileWindowReminderEnabled(enabled: boolean): Promise<void> {
  const granted = await ensurePermissions();
  if (!granted) return;

  let settings = await getSettings();

  if (!enabled) {
    if (settings.fertileWindowReminderId) {
      await Notifications.cancelScheduledNotificationAsync(settings.fertileWindowReminderId);
    }
    settings = {
      ...settings,
      fertileWindowEnabled: false,
      fertileWindowReminderId: undefined,
    };
  } else {
    settings = await scheduleFertileWindowReminder(settings, {
      title: 'Fertile Window',
      body: 'Your fertile window is starting soon.',
    });
  }

  await setSettings(settings);
}

export async function reschedulePeriodReminder(
  content: Pick<Notifications.NotificationContentInput, 'title' | 'body'>,
): Promise<void> {
  const settings = await getSettings();
  if (!settings.periodReminderEnabled) return;

  const current = await Notifications.getPermissionsAsync();
  if (!current.granted) {
    if (settings.periodReminderId) {
      await Notifications.cancelScheduledNotificationAsync(settings.periodReminderId);
    }
    await setSettings({ ...settings, periodReminderEnabled: false, periodReminderId: undefined });
    return;
  }

  const next = await scheduleOrReschedulePeriodReminder(settings, content);
  await setSettings(next);
}
