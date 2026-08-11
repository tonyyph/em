import type { PropsWithChildren } from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { colors, typography } from "@/design/tokens";

export type TextVariant =
  | "display"
  | "heroMetric"
  | "pageTitle"
  | "sectionTitle"
  | "cardTitle"
  | "body"
  | "supporting"
  | "label"
  | "caption"
  | "numeric";

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: TextVariant;
    color?: keyof typeof colors;
  }
>;

export function AppText({ children, variant = "body", color = "textPrimary", style, ...props }: AppTextProps) {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.35}
      style={[typography[variant] as TextStyle, { color: colors[color] as string }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
