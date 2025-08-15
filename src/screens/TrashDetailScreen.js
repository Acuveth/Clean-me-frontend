import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config/constants";

const TrashDetailScreen = () => {
  return (
    <View style={styles.container}>
      <MaterialIcons name="info" size={80} color={COLORS.PRIMARY} />
      <Text style={styles.title}>Trash Details</Text>
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

export default TrashDetailScreen;
