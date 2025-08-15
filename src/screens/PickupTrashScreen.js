import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config/constants";

const PickupTrashScreen = () => {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="cleaning-services"
        size={80}
        color={COLORS.PRIMARY}
      />
      <Text style={styles.title}>Pickup Trash</Text>
      <Text style={styles.subtitle}>Feature coming soon!</Text>
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
  },
});

export default PickupTrashScreen;
