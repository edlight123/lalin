import * as Notifications from 'expo-notifications';

import { getJson, setJson } from './storage';

type NotificationSettings = {
  dailyReminderEnabled: boolean;
  periodReminderEnabled: boolean;
  dailyReminderId?: string;
  periodReminderId?: string;
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

  // Best-effort: schedule a placeholder daily check-in for periods as well.
  // (True predicted-date scheduling would require re-scheduling when data changes.)
  if (settings.periodReminderId) {
    await setSettings({ ...settings, periodReminderEnabled: true });
    return;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  await setSettings({
    ...settings,
    periodReminderEnabled: true,
    periodReminderId: id,
  });
}
