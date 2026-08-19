import { useState } from "react";
import { StyleSheet } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Reveal } from "@/components/common/Reveal";
import { MomentArt } from "@/design/brand/MomentArt";
import { Screen } from "@/components/common/Screen";
import { TextField } from "@/components/forms/TextField";
import { authService } from "@/services/firebase/authService";
import { describeAuthError } from "@/services/firebase/authErrors";
import { spacing } from "@/design/tokens";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await authService.forgotPassword(email.trim());
      setMessage("Reset email sent if the account exists.");
    } catch (cause) {
      setMessage(describeAuthError(cause));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader eyebrow="Account recovery" title="Reset password" subtitle="We only send reset email through Firebase Auth when cloud auth is configured." />
      </Reveal>
      <Reveal index={1}>
        <MomentArt name="auth" height={112} style={styles.art} />
      </Reveal>
      <Reveal index={2} style={styles.form}>
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        {message ? (
          <AppText variant="supporting" color="textSecondary" style={styles.message}>
            {message}
          </AppText>
        ) : null}
        <Button loading={loading} onPress={submit}>
          Send reset email
        </Button>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: {
    marginTop: spacing.lg
  },
  form: {
    marginTop: spacing.xl
  },
  message: {
    marginBottom: spacing.md
  }
});
