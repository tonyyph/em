import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";
import { usePregnancy } from "@/hooks/usePregnancy";
import { useAppStore } from "@/store/appStore";
import { calculateEddFromLastPeriod } from "@/utils/algorithms/pregnancy";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";
import { describeCountdown } from "@/utils/format/prediction";

const TRIMESTER_STOPS = [
  { label: "T1", week: 0 },
  { label: "T2", week: 14 },
  { label: "T3", week: 28 },
  { label: "Due", week: 40 }
];

function PregnancyPath({ week }: { week: number }) {
  const { colors, elevation } = useTheme();
  const progress = Math.max(0.03, Math.min(1, week / 40));

  return (
    <View
      style={[
        styles.pathCard,
        elevation.raised,
        { backgroundColor: colors.phaseSoft.pregnancy, borderColor: colors.border }
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Pregnancy progress. Week ${week} of 40.`}
    >
      <View style={styles.pathCopy}>
        <AppText variant="eyebrow" color="textMuted">
          Gestation
        </AppText>
        <AppText variant="cardTitle">Week {week} of 40</AppText>
      </View>

      <View style={[styles.pathTrack, { backgroundColor: colors.backgroundSunken }]}>
        <View
          style={[
            styles.pathFill,
            { width: `${progress * 100}%`, backgroundColor: colors.phases.pregnancy }
          ]}
        />
        <View
          style={[
            styles.pathMarker,
            {
              left: `${progress * 100}%`,
              backgroundColor: colors.phases.pregnancy,
              borderColor: colors.surface
            }
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
    const lastPeriodStart =
      cycles.at(-1)?.startDate ?? toIsoDate(dayjs().subtract(35, "day"));
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
      <AppHeader
        eyebrow="Care journey"
        title="Pregnancy mode"
        subtitle="A related experience with a calmer, weekly cadence."
      />

      {!pregnancy || !weekInfo ? (
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
            ].map((item) => (
              <View key={item} style={styles.checkItem}>
                <View style={[styles.checkDot, { backgroundColor: colors.phases.pregnancy }]} />
                <AppText variant="supporting" color="textSecondary" style={styles.checkText}>
                  {item}
                </AppText>
              </View>
            ))}
          </View>
          <Button onPress={activate}>Activate pregnancy mode</Button>
        </View>
      ) : (
        <>
          <View style={styles.metrics}>
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
          </View>

          <PregnancyPath week={weekInfo.week} />

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
                    <AppText variant="supporting" color="textSecondary" style={styles.checkText}>
                      {item}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          </Section>

          <Section title="Safety">
            <InfoBanner
              title="Bring urgent symptoms to a clinician"
              body="Severe pain, bleeding, fever, fainting, or reduced movement later in pregnancy needs medical attention now, not a log entry."
              tone="warning"
            />
          </Section>
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
