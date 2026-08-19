import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { CornerContour } from "@/design/brand/Atmosphere";
import { EmptyArt, type EmptyArtName } from "@/design/brand/EmptyArt";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

type EmptyStateProps = {
  title: string;
  body: string;
  /** Which fragment of the landscape stands in for the missing thing. */
  art?: EmptyArtName;
  actionLabel?: string;
  onActionPress?: () => void;
};

/**
 * An empty state is drawn, not iconed.
 *
 * The artwork replaced a generic Ionicon in a tinted circle for one reason: a
 * leaf in a bubble says "empty container", and every one of these screens is a
 * person at the start of tracking rather than at the end of it. A fragment of
 * the same landscape the filled state will show says the truer thing — the
 * terrain is already here, it just has nothing on it yet.
 */
export function EmptyState({
  title,
  body,
  art = "cycle",
  actionLabel,
  onActionPress
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <CornerContour />
      <View style={styles.art}>
        <EmptyArt name={art} />
      </View>
      <AppText variant="cardTitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="supporting" color="textSecondary">
        {body}
      </AppText>
      {actionLabel && onActionPress ? (
        <Button variant="tonal" onPress={onActionPress} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    padding: spacing.lg,
    overflow: "hidden"
  },
  art: {
    marginBottom: spacing.sm,
    marginLeft: -spacing.xxs
  },
  title: {
    marginBottom: spacing.xxs
  },
  action: {
    alignSelf: "flex-start",
    marginTop: spacing.md
  }
});
