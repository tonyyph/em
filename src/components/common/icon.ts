import type Ionicons from "@expo/vector-icons/Ionicons";

export type IconName = keyof (typeof Ionicons)["glyphMap"];

/**
 * Widens a catalog icon string to an Ionicons glyph name.
 *
 * Domain entities store their icon as a plain string so that
 * `src/domain` never has to import a UI library. This is the single place
 * that crossing is made, rather than an `as never` at every call site.
 */
export const asIconName = (name: string) => name as IconName;
