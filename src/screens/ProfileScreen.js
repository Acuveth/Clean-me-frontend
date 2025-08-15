import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../config/constants";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <MaterialIcons name="person" size={80} color={COLORS.PRIMARY} />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name || "User"}!</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: COLORS.PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ProfileScreen;
