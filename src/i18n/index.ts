import { getLocales } from "expo-localization";
import { dictionaries, en, type CopyKey } from "./dictionaries";

export type SupportedLocale = keyof typeof dictionaries;
export type { CopyKey };
export { dictionaries };

export const getDeviceLocale = (): SupportedLocale => {
  const languageCode = getLocales()[0]?.languageCode;
  return languageCode === "vi" ? "vi" : "en";
};

/**
 * Falls back to English rather than rendering the raw key, so a missing
 * translation degrades to readable copy instead of leaking `care.dataControls`
 * into the interface.
 */
export const translate = (key: CopyKey, locale: SupportedLocale = getDeviceLocale()) =>
  dictionaries[locale][key] || en[key];

export const t = translate;
