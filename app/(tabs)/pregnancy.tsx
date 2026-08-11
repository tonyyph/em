import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { useAppStore } from "@/store/appStore";
import { usePregnancy } from "@/hooks/usePregnancy";
import { calculateEddFromLastPeriod } from "@/utils/algorithms/pregnancy";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";
import { colors, radius, spacing } from "@/design/tokens";

export default function PregnancyScreen() {
  const cycles = useAppStore((state) => state.cycles);
  const { pregnancy, weekInfo, setPregnancy } = usePregnancy();

  const activate = () => {
    const lastPeriodStart = cycles.at(-1)?.startDate ?? toIsoDate(dayjs().subtract(35, "day"));
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
      <AppHeader eyebrow="Care journey" title="Pregnancy mode" subtitle="A related experience with a calmer weekly cadence." />
      {!pregnancy || !weekInfo ? (
        <View style={styles.panel}>
          <AppText variant="sectionTitle">Ready when pregnancy is confirmed</AppText>
          <AppText variant="supporting" color="textSecondary" style={styles.body}>
            Ẽm can estimate EDD from last period start + 280 days, or use a clinician-confirmed due date later.
          </AppText>
          <View style={styles.previewList}>
            {["Week-by-week cadence", "Appointment checklist", "Urgent-symptom guidance"].map((item) => (
              <View key={item} style={styles.previewItem}>
                <View style={styles.checkDot} />
                <AppText variant="supporting" color="textSecondary" style={styles.checkText}>{item}</AppText>
              </View>
            ))}
          </View>
          <Button onPress={activate}>Activate pregnancy mode</Button>
        </View>
      ) : (
        <>
          <View style={styles.metrics}>
            <MetricCard label="Week" value={`${weekInfo.week}+${weekInfo.dayOfWeek}`} detail={`Trimester ${weekInfo.trimester}`} tone="warm" />
            <MetricCard label="Due date" value={dayjs(weekInfo.edd).format("MMM D")} detail={dayjs(weekInfo.edd).format("YYYY")} />
          </View>
          <PregnancyPath week={weekInfo.week} />
          <Section title="This week">
            <View style={styles.panel}>
              <AppText variant="cardTitle">{weekInfo.headline}</AppText>
              {weekInfo.checklist.map((item) => (
                <View key={item} style={styles.checkItem}>
                  <View style={styles.checkDot} />
                  <AppText variant="supporting" color="textSecondary" style={styles.checkText}>
                    {item}
                  </AppText>
                </View>
              ))}
            </View>
          </Section>
          <Section title="Safety">
            <InfoBanner title="Bring urgent symptoms to a clinician" body="Severe pain, bleeding, fever, fainting, or reduced movement later in pregnancy needs medical attention." tone="warning" />
          </Section>
        </>
      )}
    </Screen>
  );
}

function PregnancyPath({ week }: { week: number }) {
  const progress = Math.max(0.04, Math.min(1, week / 40));

  return (
    <View style={styles.pathCard} accessibilityLabel={`Pregnancy progress. Week ${week} of 40.`}>
      <View style={styles.pathCopy}>
        <AppText variant="label" color="textMuted">Gestation path</AppText>
        <AppText variant="cardTitle">Week {week} of 40</AppText>
      </View>
      <View style={styles.pathTrack}>
        <View style={[styles.pathFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.pathMarker, { left: `${progress * 100}%` }]} />
      </View>
      <View style={styles.trimesterRow}>
        <AppText variant="caption" color="textMuted">T1</AppText>
        <AppText variant="caption" color="textMuted">T2</AppText>
        <AppText variant="caption" color="textMuted">T3</AppText>
        <AppText variant="caption" color="textMuted">Due</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg
  },
  body: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg
  },
  previewList: {
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  previewItem: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  pathCard: {
    marginTop: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceWarm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: "hidden"
  },
  pathCopy: {
    marginBottom: spacing.sm
  },
  pathTrack: {
    height: 16,
    borderRadius: radius.full,
    backgroundColor: "rgba(37, 28, 30, 0.1)",
    overflow: "visible",
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },
  pathFill: {
    height: 16,
    borderRadius: radius.full,
    backgroundColor: colors.phases.pregnancy
  },
  pathMarker: {
    position: "absolute",
    top: -8,
    width: 32,
    height: 32,
    marginLeft: -16,
    borderRadius: radius.full,
    borderWidth: 5,
    borderColor: colors.surface,
    backgroundColor: colors.phases.pregnancy
  },
  trimesterRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  checkItem: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    backgroundColor: colors.phases.pregnancy
  },
  checkText: {
    flex: 1
  }
});
