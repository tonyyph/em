import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Screen } from "@/components/common/Screen";
import { TextField } from "@/components/forms/TextField";
import { authService } from "@/services/firebase/authService";
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
    } catch {
      setMessage("Password reset needs Firebase configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppHeader eyebrow="Account recovery" title="Reset password" subtitle="We only send reset email through Firebase Auth when cloud auth is configured." />
      <View style={styles.form}>
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        {message ? (
          <AppText variant="supporting" color="textSecondary" style={styles.message}>
            {message}
          </AppText>
        ) : null}
        <Button loading={loading} onPress={submit}>
          Send reset email
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.xl
  },
  message: {
    marginBottom: spacing.md
  }
});
