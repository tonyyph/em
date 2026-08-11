import { getLocales } from "expo-localization";

export const dictionaries = {
  en: {
    appName: "Ẽm",
    privacy: "Private by design",
    reminders: "Reminders"
  },
  vi: {
    appName: "Ẽm",
    privacy: "Riêng tư từ thiết kế",
    reminders: "Nhắc nhở"
  }
};

export type SupportedLocale = keyof typeof dictionaries;

export const getDeviceLocale = (): SupportedLocale => {
  const languageCode = getLocales()[0]?.languageCode;
  return languageCode === "vi" ? "vi" : "en";
};

export const t = (key: keyof typeof dictionaries.en, locale = getDeviceLocale()) => dictionaries[locale][key];
