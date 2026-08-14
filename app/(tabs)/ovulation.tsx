import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { Chip } from "@/components/common/Chip";
import { HeroMetric } from "@/components/common/HeroMetric";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useOvulation } from "@/hooks/useOvulation";
import { spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";
import { describeCountdown } from "@/utils/format/prediction";

export default function OvulationScreen() {
  const { prediction, ovulationLogs } = useOvulation();

  // The hero counts whole days and never goes negative — an ovulation estimate
  // that has already passed should read as "today", not as "-2 days".
  const daysToOvulation = Math.max(
    0,
    dayjs(prediction.ovulationDay).startOf("day").diff(dayjs().startOf("day"), "day")
  );

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Fertility detail"
          title="Fertile window"
          subtitle="A transparent estimate, not contraception and not diagnosis."
        />
      </Reveal>

      <Reveal index={1}>
        <HeroMetric
          eyebrow="Estimated ovulation"
          value={daysToOvulation}
          unit={daysToOvulation === 1 ? "day away" : "days away"}
          caption={
            daysToOvulation === 0
              ? `Ẽm places ovulation around today, ${dayjs(prediction.ovulationDay).format("MMMM D")}. This is arithmetic on your cycle history, not a measurement.`
              : `Ẽm places ovulation around ${dayjs(prediction.ovulationDay).format("MMMM D")}. This is arithmetic on your cycle history, not a measurement.`
          }
          phase="ovulation"
        />
      </Reveal>

      <Reveal index={2} style={styles.metrics}>
        <MetricCard
          label="Window starts"
          value={dayjs(prediction.fertileWindowStart).format("MMM D")}
          qualifier="estimate"
          detail={`ends ${dayjs(prediction.fertileWindowEnd).format("MMM D")}`}
          phase="fertile"
          icon="leaf-outline"
        />
        <MetricCard
          label="Ovulation"
          value={dayjs(prediction.ovulationDay).format("MMM D")}
          qualifier="estimate"
          detail={describeCountdown(prediction.ovulationDay)}
          phase="ovulation"
          icon="sunny-outline"
        />
      </Reveal>

      <Reveal index={3}>
        <Section
          title="Optional signals"
          description="None of these are required. They narrow the estimate when the calendar alone cannot."
        >
          <View style={styles.chips}>
            {(
              [
                ["BBT", "thermometer-outline"],
                ["LH test", "flask-outline"],
                ["Cervical mucus", "water-outline"],
                ["Notes", "create-outline"]
              ] as const
            ).map(([item, icon]) => (
              <Chip key={item} label={item} icon={icon} />
            ))}
          </View>
        </Section>
      </Reveal>

      <Reveal index={4}>
        <Section title="Recent logs">
          {ovulationLogs.length === 0 ? (
            <EmptyState
              title="No ovulation-specific logs yet"
              body="BBT, LH, and mucus tracking are optional and can be added after the core log feels useful."
            />
          ) : (
            ovulationLogs.map((log) => (
              <InfoBanner
                key={log.id}
                title={log.date}
                body={`${log.lhTest ?? "No LH"} ${log.bbtCelsius ? `${log.bbtCelsius}C` : ""}`}
              />
            ))
          )}
        </Section>
      </Reveal>

      <Reveal index={5}>
        <InfoBanner
          title="Medical responsibility"
          body="Use clinician-backed contraception if avoiding pregnancy. Cycle prediction alone is not reliable enough."
          tone="warning"
        />
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  }
});
