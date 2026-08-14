import { forwardRef, useCallback, useMemo, useRef, type PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps
} from "@gorhom/bottom-sheet";
import { AppText } from "./AppText";
import { useTheme } from "@/design/theme";
import { layout, radius, spacing } from "@/design/tokens";

export type AppSheetRef = BottomSheetModal;

type AppSheetProps = PropsWithChildren<{
  /** Rendered as the sheet's heading and used as its accessibility label. */
  title?: string;
  /** Quiet line under the title, for the "what this means" explainers. */
  subtitle?: string;
  /** Heights the sheet rests at. Omit to size to content. */
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
}>;

/**
 * The app's only bottom sheet.
 *
 * `@gorhom/bottom-sheet` is wrapped rather than used directly so that theming,
 * the backdrop, the handle and the safe-area padding are decided once. Screens
 * import this; nothing else in the codebase imports the library. That keeps the
 * dependency swappable, and — more usefully day to day — means a sheet cannot
 * be introduced that quietly forgets the warm ground or the dark-mode handle.
 *
 * Sheets carry `elevation.sheet`, the tier reserved for surfaces that overlay
 * the page.
 */
export const AppSheet = forwardRef<AppSheetRef, AppSheetProps>(function AppSheet(
  { children, title, subtitle, snapPoints, onDismiss },
  ref
) {
  const { colors, elevation } = useTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        // The scrim is a palette token rather than gorhom's default black at
        // 0.5: on warm paper a neutral scrim greys the whole app, and the
        // token already carries the right warmth for each theme.
        style={[props.style, { backgroundColor: colors.scrim }]}
      />
    ),
    [colors.scrim]
  );

  const backgroundStyle = useMemo(
    () => ({ backgroundColor: colors.surface }),
    [colors.surface]
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, backgroundStyle, elevation.sheet]}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
    >
      <BottomSheetView style={styles.content}>
        {title ? (
          <View style={styles.header}>
            <AppText variant="sectionTitle">{title}</AppText>
            {subtitle ? (
              <AppText variant="supporting" color="textSecondary" style={styles.subtitle}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        ) : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

/**
 * Ergonomics for the common case: a screen that owns one sheet and wants to
 * open it from a handler without threading a ref through its own JSX.
 */
export function useAppSheet() {
  const ref = useRef<AppSheetRef>(null);

  const open = useCallback(() => ref.current?.present(), []);
  const close = useCallback(() => ref.current?.dismiss(), []);

  return { ref, open, close };
}

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl
  },
  content: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl
  },
  header: {
    marginBottom: spacing.md
  },
  subtitle: {
    marginTop: spacing.xxs
  }
});
