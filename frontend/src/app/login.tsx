import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AppColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setError("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mark}>
          <Text style={styles.markText}>S</Text>
        </View>
        <Text style={styles.brand}>silambu</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Keep an eye on what matters most.</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={AppColors.muted}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor={AppColors.muted}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Text style={styles.show}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            onPress={handleLogin}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Log in</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable>
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>
          Don't have an account?{" "}
          <Link href="/signup" style={styles.link}>
            Sign up
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.canvas },
  content: { flexGrow: 1, padding: 28, justifyContent: "center" },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: AppColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  brand: {
    color: AppColors.ink,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
  },
  title: {
    color: AppColors.ink,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 46,
  },
  subtitle: { color: AppColors.muted, fontSize: 16, marginTop: 8 },
  form: { marginTop: 34 },
  label: {
    color: AppColors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.line,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: AppColors.ink,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.line,
    borderRadius: 12,
  },
  passwordInput: { flex: 1, padding: 15, fontSize: 16, color: AppColors.ink },
  show: { color: AppColors.teal, fontWeight: "700", padding: 15 },
  error: { color: AppColors.red, marginTop: 12 },
  primaryButton: {
    backgroundColor: AppColors.teal,
    borderRadius: 12,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.line,
  },
  dividerText: {
    color: AppColors.muted,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.line,
    borderRadius: 12,
    minHeight: 52,
  },
  googleButtonText: {
    color: AppColors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  forgot: {
    color: AppColors.teal,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },
  footer: { color: AppColors.muted, textAlign: "center", marginTop: 42 },
  link: { color: AppColors.teal, fontWeight: "800" },
  pressed: { opacity: 0.8 },
});
