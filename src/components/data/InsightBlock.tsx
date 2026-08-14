import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { LinearTransition } from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import { Tappable } from "@/components/common/Tappable";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

export type InsightSignal = "strong" | "moderate" | "early";

type InsightBlockProps = {
  label: string;
  title: string;
  body: string;
  signal?: InsightSignal;
  /**
   * Extra reasoning revealed on tap — how the app reached this, and what would
   * sharpen it. Without this the block stays a plain, non-interactive read.
   */
  detail?: string;
};

const SIGNAL_COPY: Record<InsightSignal, string> = {
  strong: "Well supported",
  moderate: "Partly supported",
  early: "Early days"
};

export function InsightBlock({
  label,
  title,
  body,
  signal = "early",
  detail
}: InsightBlockProps) {
  const { colors, reduceMotion } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const tint = {
    strong: colors.success,
    moderate: colors.warning,
    early: colors.textMuted
  }[signal];

  const content = (
    <>
      <View style={styles.meta}>
        <AppText variant="eyebrow" color="textMuted" style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
        <View style={[styles.pill, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <AppText variant="caption" style={{ color: tint }}>
            {SIGNAL_COPY[signal]}
          </AppText>
        </View>
      </View>
      <AppText variant="cardTitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="supporting" color="textSecondary">
        {body}
      </AppText>

      {detail ? (
        <>
          {expanded ? (
            <AppText variant="supporting" color="textSecondary" style={styles.detail}>
              {detail}
            </AppText>
          ) : null}
          <View style={styles.disclosure}>
            <AppText variant="caption" style={{ color: colors.brandAction }}>
              {expanded ? "Show less" : "Why this"}
            </AppText>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={13}
              color={colors.brandAction}
            />
          </View>
        </>
      ) : null}
    </>
  );

  if (!detail) {
    return <View style={[styles.root, { borderTopColor: colors.separator }]}>{content}</View>;
  }

  return (
    <Animated.View
      // The block grows in place rather than the list jumping to its new
      // height. `LinearTransition` is skipped under reduce-motion because a
      // resize is exactly the kind of movement that setting exists to stop.
      layout={reduceMotion ? undefined : LinearTransition}
    >
      <Tappable
        dense
        haptic="selection"
        scale={0.995}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
        accessibilityHint={expanded ? "Collapses the reasoning" : "Explains how this was worked out"}
        onPress={() => setExpanded((current) => !current)}
        style={[styles.root, { borderTopColor: colors.separator }]}
      >
        {content}
      </Tappable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  label: {
    flex: 1
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.full
  },
  title: {
    marginBottom: spacing.xxs
  },
  detail: {
    marginTop: spacing.xs
  },
  disclosure: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: spacing.xs
  }
});
