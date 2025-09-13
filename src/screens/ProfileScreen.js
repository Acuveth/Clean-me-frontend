import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Image
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from "../config/constants";
import { useAuth } from "../context/AuthContext";
import ShareProgress from '../components/ShareProgress';
import { Layout } from '../../components/ui/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const ProfileScreen = () => {
  const { user, logout, simpleLogout } = useAuth();
  const navigation = useNavigation();
  const { shareText } = ShareProgress();

  const handleShare = async () => {
    try {
      await shareText();
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleViewBadges = () => {
    navigation.navigate('Achievements');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const confirmLogout = () => {
    console.log("🟡 confirmLogout called");
    console.log("🟡 Showing alert...");
    
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => console.log("🟡 User cancelled logout")
        },
        { 
          text: "Logout", 
          onPress: () => {
            console.log("🟡 User confirmed logout - starting logout process");
            handleLogoutConfirmed();
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  const handleLogoutConfirmed = async () => {
    console.log("🟡 handleLogoutConfirmed called");
    try {
      console.log("🟡 Calling simple logout function...");
      await simpleLogout();
      console.log("🟡 Simple logout function completed");
      // Navigation will be handled automatically by App.js when user becomes null
    } catch (error) {
      console.error('🟡 ProfileScreen logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
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
    <Layout scrollable padding="none">
      <View style={styles.container}>
        {/* Modern Profile Header */}
        <View style={styles.heroSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user?.profilePictureUrl ? (
                  <Image
                    source={{ uri: user.profilePictureUrl }}
                    style={styles.avatarImage}
                    onError={() => console.log('Failed to load profile image')}
                  />
                ) : (
                  <MaterialIcons name="eco" size={40} color={COLORS.SUCCESS} />
                )}
              </View>
              <View style={styles.levelIndicator}>
                <Text style={styles.levelNumber}>{userLevel.level}</Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || "Eco Warrior"}</Text>
              <Text style={styles.userTitle}>{userLevel.title}</Text>
              <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <Card variant="elevated" padding="medium" style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.SUCCESS + '20' }]}>
                  <MaterialIcons name="eco" size={24} color={COLORS.SUCCESS} />
                </View>
                <Text style={styles.statValue}>{user?.points || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Eco Points</Text>
              <Text style={styles.statTrend}>+12% this month</Text>
            </Card>

            <Card variant="elevated" padding="medium" style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.TEXT_SECONDARY + '20' }]}>
                  <MaterialIcons name="cleaning-services" size={24} color={COLORS.TEXT_SECONDARY} />
                </View>
                <Text style={styles.statValue}>{user?.totalCleanups || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Cleanups</Text>
              <Text style={styles.statTrend}>This year</Text>
            </Card>

            <Card variant="elevated" padding="medium" style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.TEXT_SECONDARY + '20' }]}>
                  <MaterialIcons name="add-location" size={24} color={COLORS.TEXT_SECONDARY} />
                </View>
                <Text style={styles.statValue}>{user?.totalReports || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Reports</Text>
              <Text style={styles.statTrend}>Total submitted</Text>
            </Card>
          </View>
        </View>

        {/* Action Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Profile & Settings</Text>
          
          <Card variant="elevated" padding="none" style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <View style={styles.menuIcon}>
                <MaterialIcons name="edit" size={20} color={COLORS.TEXT_SECONDARY} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Edit Profile</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_TERTIARY} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleViewBadges}>
              <View style={styles.menuIcon}>
                <MaterialIcons name="military-tech" size={20} color={COLORS.TEXT_SECONDARY} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Achievements</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_TERTIARY} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <View style={styles.menuIcon}>
                <MaterialIcons name="share" size={20} color={COLORS.TEXT_SECONDARY} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Share Progress</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_TERTIARY} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
              <View style={styles.menuIcon}>
                <MaterialIcons name="settings" size={20} color={COLORS.TEXT_SECONDARY} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Settings</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.TEXT_TERTIARY} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <Button
            title="Sign Out"
            onPress={confirmLogout}
            variant="danger"
            size="large"
            icon="logout"
            fullWidth
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Trash Clean v1.0.0</Text>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: COLORS.SURFACE,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
  },
  levelIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.SURFACE,
  },
  levelNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
  },
  userTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.SUCCESS,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },

  // Stats Section
  statsSection: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  statTrend: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },

  // Menu Section
  menuSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  menuCard: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.SURFACE_VARIANT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  menuDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
    marginLeft: SPACING.lg + 40 + SPACING.md,
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  versionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_DISABLED,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
    textTransform: 'uppercase',
  },
});

export default ProfileScreen;
