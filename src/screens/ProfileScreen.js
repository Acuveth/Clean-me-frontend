import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView,
  Alert,
  Share,
  LinearGradient
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../config/constants";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out Trash Clean! I've helped clean up ${user?.trashCollected || 0} pieces of trash and earned ${user?.points || 0} points! 🌍♻️`,
        title: 'Trash Clean App'
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Profile editing will be available in a future update!");
  };

  const handleViewBadges = () => {
    Alert.alert("Badges", "Badge system coming soon! Keep cleaning to unlock achievements! 🏆");
  };

  const handleSettings = () => {
    Alert.alert("Settings", "Settings panel coming soon!");
  };

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: "destructive" }
      ]
    );
  };

  const getUserLevel = (points) => {
    if (points < 100) return { level: 1, title: "Eco Beginner" };
    if (points < 500) return { level: 2, title: "Trash Hunter" };
    if (points < 1500) return { level: 3, title: "Eco Warrior" };
    if (points < 3000) return { level: 4, title: "Green Hero" };
    return { level: 5, title: "Planet Savior" };
  };

  const userLevel = getUserLevel(user?.points || 0);

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <MaterialIcons name="eco" size={50} color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.userName}>{user?.name || "Eco Warrior"}</Text>
        <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
        <View style={styles.levelBadge}>
          <MaterialIcons name="stars" size={16} color={COLORS.PRIMARY} />
          <Text style={styles.levelText}>Level {userLevel.level} - {userLevel.title}</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="eco" size={30} color={COLORS.SUCCESS} />
          <Text style={styles.statNumber}>{user?.points || 0}</Text>
          <Text style={styles.statLabel}>Eco Points</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="delete-outline" size={30} color={COLORS.INFO} />
          <Text style={styles.statNumber}>{user?.trashCollected || 0}</Text>
          <Text style={styles.statLabel}>Items Cleaned</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="workspace-premium" size={30} color={COLORS.WARNING} />
          <Text style={styles.statNumber}>{Math.floor((user?.points || 0) / 100)}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <MaterialIcons name="edit" size={24} color={COLORS.TEXT_PRIMARY} />
          <Text style={styles.actionText}>Edit Profile</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleViewBadges}>
          <MaterialIcons name="military-tech" size={24} color={COLORS.TEXT_PRIMARY} />
          <Text style={styles.actionText}>Achievements</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <MaterialIcons name="share" size={24} color={COLORS.TEXT_PRIMARY} />
          <Text style={styles.actionText}>Share Progress</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
          <MaterialIcons name="settings" size={24} color={COLORS.TEXT_PRIMARY} />
          <Text style={styles.actionText}>Settings</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* Impact Section */}
      <View style={styles.impactContainer}>
        <Text style={styles.sectionTitle}>🌍 Your Environmental Impact</Text>
        <View style={styles.impactCard}>
          <View style={styles.impactRow}>
            <MaterialIcons name="co2" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.impactText}>~{Math.round((user?.points || 0) * 0.1)} kg CO₂ saved</Text>
          </View>
          <View style={styles.impactRow}>
            <MaterialIcons name="water-drop" size={20} color={COLORS.INFO} />
            <Text style={styles.impactText}>~{Math.round((user?.points || 0) * 0.5)} L water protected</Text>
          </View>
          <View style={styles.impactRow}>
            <MaterialIcons name="pets" size={20} color={COLORS.WARNING} />
            <Text style={styles.impactText}>{Math.floor((user?.points || 0) / 50)} wildlife helped</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Keep up the great work! 🌱</Text>
        <Text style={styles.versionText}>Trash Clean v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.SURFACE,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.SURFACE_VARIANT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 15,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_VARIANT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 15,
  },
  impactContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  impactCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 10,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ERROR,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.TEXT_DISABLED,
  },
});

export default ProfileScreen;
