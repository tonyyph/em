import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { Button } from "@/components/common/Button";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Screen } from "@/components/common/Screen";
import { TextField } from "@/components/forms/TextField";
import { authService } from "@/services/firebase/authService";
import { spacing } from "@/design/tokens";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      setLoading(true);
      setError(undefined);
      await authService.registerWithEmail(email.trim(), password, displayName.trim());
      router.replace("/(tabs)");
    } catch {
      setError("Account creation needs Firebase configuration and a valid password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <AppHeader eyebrow="Secure profile" title="Create account" subtitle="Use this when you are ready for cloud sync across devices." />
      {!authService.isConfigured() ? (
        <InfoBanner title="Firebase is not connected yet" body="Use anonymous mode from sign-in until project credentials are added." tone="warning" />
      ) : null}
      <View style={styles.form}>
        <TextField label="Name" value={displayName} onChangeText={setDisplayName} textContentType="name" />
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" error={error} />
        <Button loading={loading} onPress={register}>
          Create secure account
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.xl
  }
});
