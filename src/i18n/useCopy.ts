import { useCallback, useMemo } from "react";
import { getDeviceLocale, translate, type CopyKey, type SupportedLocale } from "./index";

/**
 * Resolves copy for the active locale.
 *
 * The locale is read once per render from the device rather than held in state:
 * changing system language restarts the app on both platforms, so there is no
 * in-session transition to handle. If an in-app language picker is added later,
 * this is the single place that has to learn about it.
 */
export const useCopy = (override?: SupportedLocale) => {
  const locale = useMemo(() => override ?? getDeviceLocale(), [override]);

  const t = useCallback((key: CopyKey) => translate(key, locale), [locale]);

  return { t, locale };
};
