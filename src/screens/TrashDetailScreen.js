import React, { useEffect, useState } from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, API_BASE_URL } from "../config/constants";
import {
  fetchTrashReportById,
  clearCurrentReport
} from "../store/trashSlice";

const TrashDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { reportId } = route.params;
  const { currentReport, reportLoading, reportError } = useSelector((state) => state.trash);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (reportId) {
      dispatch(fetchTrashReportById(reportId));
    }

    return () => {
      dispatch(clearCurrentReport());
    };
  }, [dispatch, reportId]);

  useEffect(() => {
    if (reportError) {
      Alert.alert("Error", reportError, [
        {
          text: "Go Back",
          onPress: () => navigation.goBack(),
        },
        {
          text: "Retry",
          onPress: () => dispatch(fetchTrashReportById(reportId)),
        },
      ]);
    }
  }, [reportError, navigation, dispatch, reportId]);

  const handlePickupNavigation = () => {
    if (currentReport && currentReport.status === 'pending') {
      navigation.navigate('PickupVerification', {
        trashReport: currentReport,
        returnScreen: 'TrashDetail'
      });
    }
  };

  const handleOpenMaps = () => {
    if (currentReport && currentReport.latitude && currentReport.longitude) {
      const lat = parseFloat(currentReport.latitude);
      const lng = parseFloat(currentReport.longitude);
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Report Issue",
      "What issue would you like to report?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Not Found", onPress: () => reportIssue('not_found') },
        { text: "Already Cleaned", onPress: () => reportIssue('already_cleaned') },
        { text: "Inaccessible", onPress: () => reportIssue('inaccessible') },
        { text: "Wrong Location", onPress: () => reportIssue('wrong_location') },
      ]
    );
  };

  const reportIssue = async (issueType) => {
    // This would typically make an API call
    Alert.alert("Thank you", "Your issue report has been submitted for review.");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinate = (coord) => {
    if (!coord) return '0.000000';
    const num = parseFloat(coord);
    return isNaN(num) ? '0.000000' : num.toFixed(6);
  };

  const getTrashTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'plastic': return 'water-drop';
      case 'glass': return 'wine-bar';
      case 'metal': return 'build';
      case 'organic': return 'eco';
      case 'hazardous': return 'warning';
      default: return 'delete';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return COLORS.SUCCESS;
      case 'medium': return COLORS.WARNING;
      case 'high': return COLORS.ERROR;
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return COLORS.WARNING;
      case 'cleaned': return COLORS.SUCCESS;
      case 'verified': return COLORS.SUCCESS;
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  if (reportLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading report details...</Text>
      </View>
    );
  }

  if (reportError || !currentReport) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={80} color={COLORS.ERROR} />
        <Text style={styles.errorTitle}>Report Not Found</Text>
        <Text style={styles.errorText}>
          {reportError || "The requested report could not be loaded."}
        </Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl = currentReport.photo_url ? `${API_BASE_URL}${currentReport.photo_url}` : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trash Details</Text>
        <TouchableOpacity onPress={handleReportIssue} style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            {!imageError ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.trashImage}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="image-not-supported" size={60} color={COLORS.TEXT_DISABLED} />
                <Text style={styles.imagePlaceholderText}>Image unavailable</Text>
              </View>
            )}
          </View>
        )}

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(currentReport.status) }]}>
          <MaterialIcons 
            name={currentReport.status === 'cleaned' ? 'check-circle' : 'schedule'} 
            size={20} 
            color={COLORS.TEXT_PRIMARY} 
          />
          <Text style={styles.statusText}>
            {currentReport.status === 'cleaned' ? 'Cleaned' : 'Awaiting Cleanup'}
          </Text>
        </View>

        {/* Main Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Report Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name={getTrashTypeIcon(currentReport.trash_type)} size={24} color={COLORS.PRIMARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{currentReport.trash_type || 'General'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="straighten" size={24} color={COLORS.PRIMARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Size</Text>
                <Text style={styles.infoValue}>{currentReport.size || 'Medium'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="star" size={24} color={COLORS.PRIMARY} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Points</Text>
                <Text style={styles.infoValue}>{currentReport.points || 0} pts</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="warning" size={24} color={getSeverityColor(currentReport.severity)} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Severity</Text>
                <Text style={[styles.infoValue, { color: getSeverityColor(currentReport.severity) }]}>
                  {currentReport.severity || 'Medium'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {(currentReport.description || currentReport.ai_description) && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {currentReport.ai_description || currentReport.description}
              </Text>
            </View>
          )}

          {/* Location Details */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationInfo}>
              <MaterialIcons name="location-on" size={24} color={COLORS.PRIMARY} />
              <View style={styles.locationContent}>
                <Text style={styles.locationText}>
                  {currentReport.location_context || 'Location details not available'}
                </Text>
                <Text style={styles.coordinatesText}>
                  {formatCoordinate(currentReport.latitude)}, {formatCoordinate(currentReport.longitude)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleOpenMaps} style={styles.mapButton}>
                <MaterialIcons name="open-in-new" size={20} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reported by</Text>
              <Text style={styles.infoValue}>{currentReport.reporter_name || 'Anonymous'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Report date</Text>
              <Text style={styles.infoValue}>{formatDate(currentReport.created_at)}</Text>
            </View>

            {currentReport.trash_count && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Item count</Text>
                <Text style={styles.infoValue}>{currentReport.trash_count} item(s)</Text>
              </View>
            )}

            {currentReport.cleaned_at && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cleaned date</Text>
                <Text style={styles.infoValue}>{formatDate(currentReport.cleaned_at)}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {currentReport.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.pickupButton]} 
            onPress={handlePickupNavigation}
          >
            <MaterialIcons name="cleaning-services" size={24} color={COLORS.TEXT_PRIMARY} />
            <Text style={styles.actionButtonText}>Pick Up Trash</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    paddingTop: SPACING.xxxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.SURFACE,
    ...SHADOWS.sm,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.SURFACE,
  },
  trashImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  imagePlaceholderText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_DISABLED,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
  },
  detailsContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    flex: 1,
    minWidth: '45%',
    gap: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    color: COLORS.TEXT_PRIMARY,
  },
  descriptionSection: {
    marginBottom: SPACING.xl,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  locationSection: {
    marginBottom: SPACING.xl,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  locationContent: {
    flex: 1,
  },
  locationText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  mapButton: {
    padding: SPACING.xs,
  },
  additionalInfo: {
    marginBottom: SPACING.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  actionButtons: {
    padding: SPACING.lg,
    backgroundColor: COLORS.SURFACE,
    ...SHADOWS.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  pickupButton: {
    backgroundColor: COLORS.BUTTON.SUCCESS_BG,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.base,
  },
  errorButton: {
    backgroundColor: COLORS.BUTTON.PRIMARY_BG,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  errorButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default TrashDetailScreen;
