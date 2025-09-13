import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  SafeAreaView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import storage from '../utils/storage';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import ShareProgress from '../components/ShareProgress';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const authContext = useAuth();

  // Add defensive check for auth context
  if (!authContext) {
    console.error('SettingsScreen: AuthContext is undefined');
    return null;
  }

  const { user, logout } = authContext;
  const { shareAppInvite } = ShareProgress();
  
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    dataCollection: false,
    autoSync: true,
    soundEffects: true,
    darkMode: true, // Always true since we're using dark theme
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storage.getItemAsync('userSettings');
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await storage.setItemAsync('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by App.js when user becomes null
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your account has been scheduled for deletion. This feature will be implemented in a future update.'
            );
          }
        },
      ]
    );
  };

  const handleClearCache = async () => {
    try {
      // Clear app cache (excluding user settings and auth data)
      await storage.deleteItemAsync('cachedReports');
      await storage.deleteItemAsync('cachedImages');
      Alert.alert('Success', 'Cache cleared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache. Please try again.');
    }
  };

  const openURL = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon} size={24} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <MaterialIcons name="chevron-right" size={24} color={COLORS.TEXT_SECONDARY} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SectionDivider = () => <View style={styles.sectionDivider} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingItem
            icon="person"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingItem
            icon="emoji-events"
            title="Achievements"
            subtitle="View your progress and badges"
            onPress={() => navigation.navigate('Achievements')}
          />
          <SettingItem
            icon="share"
            title="Share App"
            subtitle="Invite friends to join Trash Clean"
            onPress={shareAppInvite}
          />
        </View>

        <SectionDivider />

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Get notified about new trash reports nearby"
            rightComponent={
              <Switch
                value={settings.notifications}
                onValueChange={() => handleToggleSetting('notifications')}
                trackColor={{ false: COLORS.TEXT_DISABLED, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_PRIMARY}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="location-on"
            title="Location Tracking"
            subtitle="Allow app to use your location for nearby reports"
            rightComponent={
              <Switch
                value={settings.locationTracking}
                onValueChange={() => handleToggleSetting('locationTracking')}
                trackColor={{ false: COLORS.TEXT_DISABLED, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_PRIMARY}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="volume-up"
            title="Sound Effects"
            subtitle="Play sounds for actions and achievements"
            rightComponent={
              <Switch
                value={settings.soundEffects}
                onValueChange={() => handleToggleSetting('soundEffects')}
                trackColor={{ false: COLORS.TEXT_DISABLED, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_PRIMARY}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="sync"
            title="Auto Sync"
            subtitle="Automatically sync data when online"
            rightComponent={
              <Switch
                value={settings.autoSync}
                onValueChange={() => handleToggleSetting('autoSync')}
                trackColor={{ false: COLORS.TEXT_DISABLED, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_PRIMARY}
              />
            }
            showArrow={false}
          />
        </View>

        <SectionDivider />

        {/* Privacy & Data Section */}
        <SectionHeader title="Privacy & Data" />
        <View style={styles.section}>
          <SettingItem
            icon="analytics"
            title="Data Collection"
            subtitle="Help improve the app by sharing usage data"
            rightComponent={
              <Switch
                value={settings.dataCollection}
                onValueChange={() => handleToggleSetting('dataCollection')}
                trackColor={{ false: COLORS.TEXT_DISABLED, true: COLORS.PRIMARY }}
                thumbColor={COLORS.TEXT_PRIMARY}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="delete-sweep"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
          <SettingItem
            icon="download"
            title="Download My Data"
            subtitle="Export all your data"
            onPress={() => Alert.alert('Info', 'Data export feature coming soon!')}
          />
        </View>

        <SectionDivider />

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            icon="help"
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={() => Alert.alert('Info', 'Help center coming soon!')}
          />
          <SettingItem
            icon="feedback"
            title="Send Feedback"
            subtitle="Share your thoughts and suggestions"
            onPress={() => Alert.alert('Info', 'Feedback feature coming soon!')}
          />
          <SettingItem
            icon="bug-report"
            title="Report a Bug"
            subtitle="Help us fix issues"
            onPress={() => Alert.alert('Info', 'Bug reporting feature coming soon!')}
          />
          <SettingItem
            icon="info"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('Trash Clean', 'Version 1.0.0\n\nMaking the world cleaner, one pickup at a time! 🌍')}
          />
        </View>

        <SectionDivider />

        {/* Legal Section */}
        <SectionHeader title="Legal" />
        <View style={styles.section}>
          <SettingItem
            icon="description"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => openURL('https://trashclean.com/terms')}
          />
          <SettingItem
            icon="privacy-tip"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => openURL('https://trashclean.com/privacy')}
          />
          <SettingItem
            icon="gavel"
            title="Licenses"
            subtitle="Open source licenses"
            onPress={() => Alert.alert('Info', 'Licenses page coming soon!')}
          />
        </View>

        <SectionDivider />

        {/* Danger Zone */}
        <SectionHeader title="Account Actions" />
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={COLORS.ERROR} />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={24} color={COLORS.ERROR} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: COLORS.SURFACE,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SURFACE_VARIANT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 18,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
    marginHorizontal: 16,
    marginTop: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ERROR,
  },
  bottomPadding: {
    height: 40,
  },
});

export default SettingsScreen;