import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from "../config/constants";
import { useAuth } from "../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Layout } from "../../components/ui/Layout";

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = isLogin
      ? await login(email, password)
      : await register(email, name, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setName("");
    setPassword("");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    
    if (!result.success) {
      Alert.alert("Error", result.error);
    }
  };


  return (
    <Layout scrollable safeArea={false} padding="none">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="eco" size={48} color={COLORS.SUCCESS} />
            </View>
            <Text style={styles.appName}>Trash Clean</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Card variant="elevated" padding="large" style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isLogin ? "Welcome Back" : "Join the Movement"}
            </Text>
            
            <View style={styles.formContent}>
              {!isLogin && (
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  icon="person"
                  variant="outlined"
                  autoCapitalize="words"
                  containerStyle={styles.inputSpacing}
                />
              )}

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                icon="email"
                variant="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                containerStyle={styles.inputSpacing}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                icon="lock"
                variant="outlined"
                secureTextEntry
                autoComplete="password"
                containerStyle={styles.inputSpacing}
              />

              <Button
                title={isLogin ? "Sign In" : "Sign Up"}
                onPress={handleAuth}
                variant="primary"
                size="large"
                icon={isLogin ? "login" : "person-add"}
                loading={loading}
                disabled={loading}
                fullWidth
                elevated
                style={styles.primaryButton}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.divider} />
              </View>

              <Button
                title="Continue with Google"
                onPress={handleGoogleLogin}
                variant="secondary"
                size="large"
                icon="g-translate"
                loading={loading}
                disabled={loading}
                fullWidth
                style={styles.socialButton}
              />

              <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                <Text style={styles.toggleText}>
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Demo credentials */}
          <Card variant="outlined" padding="medium" style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoText}>Email: demo@trashclean.com</Text>
            <Text style={styles.demoText}>Password: demo123</Text>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  appName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.sm,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  tagline: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.md,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
  },
  formSection: {
    flex: 0.6,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  formContent: {
    gap: SPACING.sm,
  },
  inputSpacing: {
    marginBottom: SPACING.md,
  },
  primaryButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  socialButton: {
    marginBottom: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.DIVIDER,
  },
  dividerText: {
    color: COLORS.TEXT_TERTIARY,
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    paddingHorizontal: SPACING.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
    textTransform: 'uppercase',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  toggleText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  demoCard: {
    borderStyle: 'dashed',
  },
  demoTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
    textTransform: 'uppercase',
  },
  demoText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    fontFamily: 'monospace',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.sm,
  },
});

export default LoginScreen;
