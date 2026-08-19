import { useState } from "react";
import { Link, router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { TextField } from "@/components/forms/TextField";
import { authService } from "@/services/firebase/authService";
import { describeAuthError } from "@/services/firebase/authErrors";
import { EmMark } from "@/design/brand/EmMark";
import { MomentArt } from "@/design/brand/MomentArt";
import { spacing } from "@/design/tokens";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      setError(undefined);
      await authService.loginWithEmail(email.trim(), password);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(describeAuthError(cause));
    } finally {
      setLoading(false);
    }
  };

  const anonymous = async () => {
    try {
      await authService.loginAnonymously();
    } catch {
      // Local-only mode remains available without Firebase.
    } finally {
      router.replace("/(tabs)");
    }
  };

  return (
    <Screen>
      <Reveal index={0}>
        <View style={styles.brandMark}>
          <EmMark size={26} />
          <AppText variant="label">Ẽm</AppText>
        </View>
      </Reveal>
      <Reveal index={1}>
        <AppHeader
          eyebrow="Private account"
          title="Welcome back"
          subtitle="Sign in to sync, or stay entirely local with anonymous mode."
        />
      </Reveal>
      <Reveal index={2}>
        <MomentArt name="auth" height={124} style={styles.art} />
      </Reveal>
      {!authService.isConfigured() ? (
        <InfoBanner title="Cloud sync is not configured" body="The app still runs in local anonymous mode. Fill .env to enable email auth." tone="warning" />
      ) : null}
      <Reveal index={3} style={styles.form}>
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" error={error} />
        <Button loading={loading} onPress={login}>
          Sign in
        </Button>
        <Button variant="tonal" onPress={anonymous}>
          Continue anonymously
        </Button>
      </Reveal>
      <Reveal index={4} style={styles.links}>
        <Link href="/auth/register">
          <AppText variant="label" color="brandAction">Create account</AppText>
        </Link>
        <Link href="/auth/forgot-password">
          <AppText variant="label" color="textSecondary">Forgot password</AppText>
        </Link>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md
  },
  art: {
    marginTop: spacing.lg
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.xs
  },
  links: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});
