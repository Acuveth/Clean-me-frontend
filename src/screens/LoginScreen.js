import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config/constants";
import { useAuth } from "../context/AuthContext";

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" backgroundColor={COLORS.PRIMARY} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <MaterialIcons name="eco" size={60} color="white" />
          <Text style={styles.appName}>Trash Clean</Text>
          <Text style={styles.tagline}>Clean up the world together</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isLogin ? "Welcome Back!" : "Join the Movement!"}
          </Text>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="person"
                size={20}
                color={COLORS.PRIMARY}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={20}
              color={COLORS.PRIMARY}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="lock"
              size={20}
              color={COLORS.PRIMARY}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.authButton, loading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons
                  name={isLogin ? "login" : "person-add"}
                  size={20}
                  color="white"
                />
                <Text style={styles.authButtonText}>
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>

          {/* Demo credentials for testing */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Credentials:</Text>
            <Text style={styles.demoText}>Email: demo@trashclean.com</Text>
            <Text style={styles.demoText}>Password: demo123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: COLORS.SURFACE,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: COLORS.TEXT_PRIMARY,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  authButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  toggleButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  toggleText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
  },
  demoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginBottom: 5,
  },
  demoText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default LoginScreen;
