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

export default function SignupScreen() {
  const { signup, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    childName: "",
    childAge: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSignup() {
    if (!form.name.trim()) return setError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return setError("Enter a valid email address.");
    if (!/^\+?[0-9 ()-]{8,}$/.test(form.phone))
      return setError("Enter a valid phone number.");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    setError("");
    setIsSubmitting(true);
    try {
      await signup(
        form.name.trim(),
        form.email.trim(),
        form.phone.trim(),
        form.password,
        form.childName.trim(),
        form.childAge.trim()
      );
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Google sign-up failed. Please try again.");
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
        <Text style={styles.back} onPress={() => router.back()}>
          Back
        </Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Set up a safer way to stay connected.
        </Text>
        {(
          [
            ["name", "Full name", "Your name"],
            ["email", "Email address", "you@example.com"],
            ["phone", "Phone number", "+1 555 000 0000"],
            ["childName", "Child's name (Optional)", "E.g., Aarav"],
            ["childAge", "Child's age (Optional)", "E.g., 8"],
            ["password", "Password", "At least 8 characters"],
            ["confirm", "Confirm password", "Repeat your password"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <TextInput
            key={key}
            secureTextEntry={key === "password" || key === "confirm"}
            keyboardType={
              key === "phone"
                ? "phone-pad"
                : key === "email"
                  ? "email-address"
                  : "default"
            }
            autoCapitalize={key === "email" ? "none" : "words"}
            placeholder={placeholder}
            placeholderTextColor={AppColors.muted}
            value={form[key]}
            onChangeText={(value) => update(key, value)}
            accessibilityLabel={label}
            style={styles.input}
          />
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          onPress={handleSignup}
          disabled={isSubmitting}
          style={styles.button}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={handleGoogleSignup}
          disabled={isSubmitting}
          style={styles.googleButton}
        >
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>

        <Text style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Log in
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.canvas },
  content: { flexGrow: 1, padding: 28, justifyContent: "center" },
  back: { color: AppColors.teal, fontWeight: "700", marginBottom: 36 },
  title: { color: AppColors.ink, fontSize: 30, fontWeight: "800" },
  subtitle: {
    color: AppColors.muted,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 18,
  },
  input: {
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.line,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: AppColors.ink,
    marginTop: 12,
  },
  error: { color: AppColors.red, marginTop: 12 },
  button: {
    backgroundColor: AppColors.teal,
    borderRadius: 12,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
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
  footer: { color: AppColors.muted, textAlign: "center", marginTop: 32 },
  link: { color: AppColors.teal, fontWeight: "800" },
});

