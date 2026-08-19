import { useEffect, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { HeroMetric } from "@/components/common/HeroMetric";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion, radius, spacing } from "@/design/tokens";
import { usePregnancy } from "@/hooks/usePregnancy";
import { useAppStore } from "@/store/appStore";
import { sortCyclesByStartDate } from "@/utils/algorithms/cyclePrediction";
import { calculateEddFromLastPeriod } from "@/utils/algorithms/pregnancy";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";
import { describeCountdown } from "@/utils/format/prediction";

const TERM_WEEKS = 40;

const TRIMESTER_STOPS = [
  { label: "T1", week: 0 },
  { label: "T2", week: 14 },
  { label: "T3", week: 28 },
  { label: "Due", week: TERM_WEEKS }
];

/**
 * The gestation rule.
 *
 * The fill is measured against the track's real width rather than a percentage
 * string: Reanimated can animate a percentage, but the marker has to sit
 * exactly on the fill's leading edge, and matching a percentage against a
 * pixel-offset marker drifts at the ends of the track where it is most visible.
 */
function PregnancyPath({ week }: { week: number }) {
  const { colors, elevation, reduceMotion } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const progress = Math.max(0.03, Math.min(1, week / TERM_WEEKS));
  const travel = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    travel.value = reduceMotion
      ? 1
      : withTiming(1, {
          duration: motion.duration.deliberate,
          easing: Easing.bezier(...curves.enter)
        });
  }, [travel, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: trackWidth * progress * travel.value
  }));

  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackWidth * progress * travel.value }]
  }));

  const onLayout = (event: LayoutChangeEvent) =>
    setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View
      style={[
        styles.pathCard,
        elevation.raised,
        { backgroundColor: colors.phaseSoft.pregnancy, borderColor: colors.border }
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Pregnancy progress. Week ${week} of ${TERM_WEEKS}.`}
    >
      <View style={styles.pathCopy}>
        <AppText variant="eyebrow" color="textMuted">
          Gestation
        </AppText>
        <AppText variant="cardTitle">
          Week {week} of {TERM_WEEKS}
        </AppText>
      </View>

      <View
        onLayout={onLayout}
        style={[styles.pathTrack, { backgroundColor: colors.backgroundSunken }]}
      >
        <Animated.View
          style={[styles.pathFill, { backgroundColor: colors.phases.pregnancy }, fillStyle]}
        />
        <Animated.View
          style={[
            styles.pathMarker,
            { backgroundColor: colors.phases.pregnancy, borderColor: colors.surface },
            markerStyle
          ]}
        />
      </View>

      <View style={styles.trimesterRow}>
        {TRIMESTER_STOPS.map((stop) => (
          <AppText
            key={stop.label}
            variant="caption"
            color={week >= stop.week ? "textSecondary" : "textMuted"}
          >
            {stop.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

export default function PregnancyScreen() {
  const { colors, elevation } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const { pregnancy, weekInfo, setPregnancy } = usePregnancy();

  const activate = () => {
    // Sorted, not last-in-array: the due date is 280 days from this, so picking
    // the wrong cycle here is wrong by however far apart the two starts are.
    const lastPeriodStart =
      sortCyclesByStartDate(cycles).at(-1)?.startDate ?? toIsoDate(dayjs().subtract(35, "day"));
    const now = new Date().toISOString();
    setPregnancy({
      id: "local-pregnancy",
      lastPeriodStart,
      edd: calculateEddFromLastPeriod(lastPeriodStart),
      createdAt: now,
      updatedAt: now
    });
  };

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Care journey"
          title="Pregnancy mode"
          subtitle="A related experience with a calmer, weekly cadence."
        />
      </Reveal>

      {!pregnancy || !weekInfo ? (
        <Reveal index={1}>
          <View
            style={[
              styles.panel,
              elevation.raised,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <AppText variant="sectionTitle">Ready when pregnancy is confirmed</AppText>
            <AppText variant="supporting" color="textSecondary" style={styles.body}>
              Ẽm estimates a due date as last period start plus 280 days. A
              clinician-confirmed date should replace it as soon as you have one.
            </AppText>
            <View style={styles.previewList}>
              {[
                "Week-by-week cadence",
                "Appointment checklist",
                "Urgent-symptom guidance"
              ].map((item, position) => (
                <Reveal key={item} index={position + 2}>
                  <View style={styles.checkItem}>
                    <View
                      style={[styles.checkDot, { backgroundColor: colors.phases.pregnancy }]}
                    />
                    <AppText variant="supporting" color="textSecondary" style={styles.checkText}>
                      {item}
                    </AppText>
                  </View>
                </Reveal>
              ))}
            </View>
            <Button onPress={activate}>Activate pregnancy mode</Button>
          </View>
        </Reveal>
      ) : (
        <>
          <Reveal index={1}>
            <HeroMetric
              eyebrow="Gestation"
              value={weekInfo.week}
              unit={weekInfo.week === 1 ? "week" : "weeks"}
              caption={`Day ${weekInfo.dayOfWeek} of week ${weekInfo.week}, trimester ${weekInfo.trimester}. Due ${dayjs(weekInfo.edd).format("MMMM D")} — an estimate until a clinician confirms one.`}
              phase="pregnancy"
            />
          </Reveal>

          <Reveal index={2} style={styles.metrics}>
            <MetricCard
              label="Week"
              value={`${weekInfo.week}+${weekInfo.dayOfWeek}`}
              detail={`Trimester ${weekInfo.trimester}`}
              phase="pregnancy"
              icon="ellipse-outline"
            />
            <MetricCard
              label="Due date"
              value={dayjs(weekInfo.edd).format("MMM D")}
              qualifier="estimate"
              detail={describeCountdown(weekInfo.edd)}
              icon="calendar-outline"
            />
          </Reveal>

          <Reveal index={3}>
            <PregnancyPath week={weekInfo.week} />
          </Reveal>

          <Reveal index={4}>
            <Section title="This week">
              <View
                style={[
                  styles.panel,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}
              >
                <AppText variant="cardTitle">{weekInfo.headline}</AppText>
                <View style={styles.previewList}>
                  {weekInfo.checklist.map((item) => (
                    <View key={item} style={styles.checkItem}>
                      <View
                        style={[styles.checkDot, { backgroundColor: colors.phases.pregnancy }]}
                      />
                      <AppText
                        variant="supporting"
                        color="textSecondary"
                        style={styles.checkText}
                      >
                        {item}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </Section>
          </Reveal>

          <Reveal index={5}>
            <Section title="Safety">
              <InfoBanner
                title="Bring urgent symptoms to a clinician"
                body="Severe pain, bleeding, fever, fainting, or reduced movement later in pregnancy needs medical attention now, not a log entry."
                tone="warning"
              />
            </Section>
          </Reveal>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg
  },
  body: {
    marginTop: spacing.xs
  },
  previewList: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs
  },
  checkDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    marginTop: 8
  },
  checkText: {
    flex: 1
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  pathCard: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg
  },
  pathCopy: {
    marginBottom: spacing.md
  },
  pathTrack: {
    height: 14,
    borderRadius: radius.full,
    justifyContent: "center"
  },
  pathFill: {
    height: 14,
    borderRadius: radius.full
  },
  pathMarker: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 4,
    marginLeft: -13
  },
  trimesterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm
  }
});
