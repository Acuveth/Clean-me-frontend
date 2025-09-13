import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profileImage: null,
    bio: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profileImage: user.profilePictureUrl || null,
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to update your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera permissions to take a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileData(prev => ({
          ...prev,
          profileImage: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const saveProfile = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setLoading(true);

      const result = await updateProfile({
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        profileImage: profileData.profileImage,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.TEXT_PRIMARY} />
          ) : (
            <MaterialIcons name="check" size={24} color={COLORS.TEXT_PRIMARY} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={showImagePicker}>
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="person" size={60} color={COLORS.TEXT_SECONDARY} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <MaterialIcons name="camera-alt" size={20} color={COLORS.TEXT_PRIMARY} />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to change profile picture</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.TEXT_TERTIARY}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profileData.email}
              editable={false}
              placeholder="Email address"
              placeholderTextColor={COLORS.TEXT_TERTIARY}
            />
            <Text style={styles.inputHint}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself..."
              placeholderTextColor={COLORS.TEXT_TERTIARY}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={profileData.location}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
              placeholder="Your city or region"
              placeholderTextColor={COLORS.TEXT_TERTIARY}
            />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.totalCleanups || 0}</Text>
              <Text style={styles.statLabel}>Cleanups</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.totalReports || 0}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.rank || 'Beginner'}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </View>
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
  saveButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.PRIMARY,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderWidth: 4,
    borderColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.BACKGROUND,
  },
  imageHint: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  disabledInput: {
    backgroundColor: COLORS.SURFACE_VARIANT,
    color: COLORS.TEXT_SECONDARY,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default EditProfileScreen;