import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { CyclePrediction } from "@/domain/entities/cycle";
import { dayjs } from "@/utils/date/dayjs";

export type ReminderType = "period_due" | "period_start" | "ovulation" | "fertile_window" | "daily_log";

export type ReminderPreference = {
  type: ReminderType;
  enabled: boolean;
  hour: number;
  minute: number;
  daysBefore?: number;
};

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true
    })
  });
}

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("cycle-reminders", {
    name: "Cycle reminders",
    importance: Notifications.AndroidImportance.DEFAULT
  });
};

const scheduleAt = async (identifier: string, title: string, body: string, date: Date) => {
  if (dayjs(date).isBefore(dayjs())) {
    return undefined;
  }

  return Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: "cycle-reminders" }
  });
};

export const notificationService = {
  async requestPermissions() {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      await ensureAndroidChannel();
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    await ensureAndroidChannel();
    return requested.granted;
  },
  async cancelCycleReminders() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((notification) => notification.identifier.startsWith("cycle-"))
        .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier))
    );
  },
  async scheduleCycleReminders(prediction: CyclePrediction, preferences: ReminderPreference[]) {
    await this.requestPermissions();
    await this.cancelCycleReminders();

    const jobs = preferences
      .filter((preference) => preference.enabled)
      .map((preference) => {
        const baseDate =
          preference.type === "ovulation"
            ? prediction.ovulationDay
            : preference.type === "fertile_window"
              ? prediction.fertileWindowStart
              : prediction.nextPeriodStart;
        const date = dayjs(baseDate)
          .subtract(preference.daysBefore ?? 0, "day")
          .hour(preference.hour)
          .minute(preference.minute)
          .second(0)
          .toDate();

        const copy = {
          period_due: ["Period may start soon", "Your next period is approaching."],
          period_start: ["Period check-in", "Log flow, symptoms, or notes for today."],
          ovulation: ["Ovulation estimate", "Today is your estimated ovulation day."],
          fertile_window: ["Fertile window", "Your predicted fertile window begins soon."],
          daily_log: ["Daily log", "Take a minute to log symptoms and mood."]
        }[preference.type];

        return scheduleAt(`cycle-${preference.type}`, copy[0], copy[1], date);
      });

    return Promise.all(jobs);
  }
};
