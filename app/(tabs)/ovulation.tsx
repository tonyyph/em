import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useOvulation } from "@/hooks/useOvulation";
import { spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";

export default function OvulationScreen() {
  const { prediction, ovulationLogs } = useOvulation();

  return (
    <Screen>
      <AppHeader eyebrow="Fertility detail" title="Fertile window" subtitle="A transparent estimate, not contraception and not diagnosis." />
      <View style={styles.metrics}>
        <MetricCard label="Window starts" value={dayjs(prediction.fertileWindowStart).format("MMM D")} detail={`ends ${dayjs(prediction.fertileWindowEnd).format("MMM D")}`} tone="cool" />
        <MetricCard label="Ovulation" value={dayjs(prediction.ovulationDay).format("MMM D")} detail="Estimated" />
      </View>
      <Section title="Optional signals">
        <View style={styles.chips}>
          {["BBT", "LH test", "Cervical mucus", "Notes"].map((item) => (
            <Chip key={item} label={item} />
          ))}
        </View>
      </Section>
      <Section title="Recent logs">
        {ovulationLogs.length === 0 ? (
          <EmptyState title="No ovulation-specific logs yet" body="BBT, LH, and mucus tracking are optional and can be added after the core log feels useful." />
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
      <InfoBanner title="Medical responsibility" body="Use clinician-backed contraception if avoiding pregnancy. Cycle prediction alone is not reliable enough." tone="warning" />
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
