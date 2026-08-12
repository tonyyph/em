import type { PropsWithChildren } from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import type { ThemeColors } from "@/design/palettes";
import { maxFontSizeMultiplier, useTheme } from "@/design/theme";
import { typography, type TextVariant } from "@/design/tokens";

export type { TextVariant };

/** Only the theme keys that actually hold a colour string. */
export type TextColor = {
  [K in keyof ThemeColors]: ThemeColors[K] extends string ? K : never;
}[keyof ThemeColors];

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: TextVariant;
    color?: TextColor;
    /** Tint from the phase palette instead of a semantic colour. */
    phase?: keyof ThemeColors["phases"];
  }
>;

export function AppText({
  children,
  variant = "body",
  color = "textPrimary",
  phase,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();
  const tint = phase ? colors.phases[phase] : colors[color];

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[typography[variant] as TextStyle, { color: tint }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
