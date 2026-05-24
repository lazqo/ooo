import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ImportantDate } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Relationship Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDateReminder(date: ImportantDate): Promise<void> {
  const eventDate = new Date(date.date);

  for (const daysBefore of date.reminder_days_before) {
    const triggerDate = new Date(eventDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(9, 0, 0, 0);

    if (triggerDate > new Date()) {
      const daysLabel = daysBefore === 1 ? 'tomorrow' : `in ${daysBefore} days`;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${date.title} is ${daysLabel}`,
          body: buildReminderBody(date, daysBefore),
          data: { dateId: date.id, type: 'date_reminder' },
        },
        trigger: { date: triggerDate, repeats: false } as Notifications.DateTriggerInput,
      });
    }
  }
}

function buildReminderBody(date: ImportantDate, daysBefore: number): string {
  if (daysBefore >= 14) return 'Good time to start planning or ordering a gift.';
  if (daysBefore === 7) return 'This week — make sure you have something planned.';
  if (daysBefore === 1) return "Tomorrow. Make sure you're ready.";
  return 'Today is the day. Make it count.';
}

export async function scheduleDailyCheckinReminder(hour: number = 11): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('daily_checkin').catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily_checkin',
    content: {
      title: 'Quick check-in',
      body: "Send her a small message before the day gets too busy.",
      data: { type: 'daily_reminder' },
    },
    trigger: {
      hour,
      minute: 0,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
