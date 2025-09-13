import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const AchievementsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first trash pickup",
      icon: "eco",
      category: "beginner",
      points: 50,
      unlocked: (user?.totalCleanups || 0) >= 1,
      progress: Math.min((user?.totalCleanups || 0), 1),
      maxProgress: 1,
      rarity: "common",
    },
    {
      id: 2,
      title: "Reporter",
      description: "Report your first trash location",
      icon: "add-location",
      category: "beginner", 
      points: 25,
      unlocked: (user?.totalReports || 0) >= 1,
      progress: Math.min((user?.totalReports || 0), 1),
      maxProgress: 1,
      rarity: "common",
    },
    {
      id: 3,
      title: "Clean Sweep",
      description: "Complete 10 trash pickups",
      icon: "cleaning-services",
      category: "cleanup",
      points: 200,
      unlocked: (user?.totalCleanups || 0) >= 10,
      progress: Math.min((user?.totalCleanups || 0), 10),
      maxProgress: 10,
      rarity: "uncommon",
    },
    {
      id: 4,
      title: "Point Collector",
      description: "Earn 500 points",
      icon: "stars",
      category: "points",
      points: 100,
      unlocked: (user?.points || 0) >= 500,
      progress: Math.min((user?.points || 0), 500),
      maxProgress: 500,
      rarity: "uncommon",
    },
    {
      id: 5,
      title: "Environmental Guardian",
      description: "Complete 50 trash pickups",
      icon: "shield",
      category: "cleanup",
      points: 1000,
      unlocked: (user?.totalCleanups || 0) >= 50,
      progress: Math.min((user?.totalCleanups || 0), 50),
      maxProgress: 50,
      rarity: "rare",
    },
    {
      id: 6,
      title: "Community Helper",
      description: "Report 25 trash locations",
      icon: "group",
      category: "social",
      points: 500,
      unlocked: (user?.totalReports || 0) >= 25,
      progress: Math.min((user?.totalReports || 0), 25),
      maxProgress: 25,
      rarity: "uncommon",
    },
    {
      id: 7,
      title: "Streak Master",
      description: "Maintain a 7-day cleanup streak",
      icon: "local-fire-department",
      category: "streak",
      points: 300,
      unlocked: (user?.streakDays || 0) >= 7,
      progress: Math.min((user?.streakDays || 0), 7),
      maxProgress: 7,
      rarity: "rare",
    },
    {
      id: 8,
      title: "Legend",
      description: "Earn 5000 points",
      icon: "emoji-events",
      category: "points",
      points: 2000,
      unlocked: (user?.points || 0) >= 5000,
      progress: Math.min((user?.points || 0), 5000),
      maxProgress: 5000,
      rarity: "legendary",
    },
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-view' },
    { key: 'beginner', label: 'Beginner', icon: 'school' },
    { key: 'cleanup', label: 'Cleanup', icon: 'cleaning-services' },
    { key: 'points', label: 'Points', icon: 'stars' },
    { key: 'social', label: 'Social', icon: 'group' },
    { key: 'streak', label: 'Streak', icon: 'local-fire-department' },
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return COLORS.TEXT_SECONDARY;
      case 'uncommon':
        return COLORS.SUCCESS;
      case 'rare':
        return COLORS.INFO;
      case 'legendary':
        return COLORS.WARNING;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const renderAchievementCard = (achievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlocked ? styles.unlockedCard : styles.lockedCard
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: achievement.unlocked ? COLORS.PRIMARY : COLORS.TEXT_DISABLED }
        ]}>
          <MaterialIcons 
            name={achievement.icon} 
            size={32} 
            color={achievement.unlocked ? COLORS.TEXT_PRIMARY : COLORS.TEXT_TERTIARY} 
          />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.achievementTitle,
              !achievement.unlocked && styles.lockedText
            ]}>
              {achievement.title}
            </Text>
            <Text style={[
              styles.rarityBadge,
              { color: getRarityColor(achievement.rarity) }
            ]}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
          <Text style={[
            styles.achievementDescription,
            !achievement.unlocked && styles.lockedText
          ]}>
            {achievement.description}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      backgroundColor: achievement.unlocked ? COLORS.SUCCESS : COLORS.TEXT_DISABLED 
                    }
                  ]}
                />
              </View>
              <Text style={[
                styles.progressText,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>
            <View style={styles.pointsBadge}>
              <MaterialIcons name="stars" size={16} color={COLORS.WARNING} />
              <Text style={[
                styles.pointsText,
                !achievement.unlocked && styles.lockedText
              ]}>
                {achievement.points}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.mainScrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Overview */}
          <View style={styles.statsOverview}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
              <Text style={styles.statSubtext}>of {achievements.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
              <Text style={styles.statSubtext}>from achievements</Text>
            </View>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.key && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <MaterialIcons
                  name={category.icon}
                  size={20}
                  color={selectedCategory === category.key ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY}
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Achievements List */}
          <View style={styles.achievementsList}>
            {filteredAchievements.map(renderAchievementCard)}
            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>
      </Animated.View>
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
  mainScrollView: {
    flex: 1,
  },
  statsOverview: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  categoryFilter: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryContent: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 6,
  },
  selectedCategory: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: COLORS.TEXT_PRIMARY,
  },
  achievementsList: {
    paddingHorizontal: 16,
  },
  achievementCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  unlockedCard: {
    borderColor: COLORS.SUCCESS,
    shadowColor: COLORS.SUCCESS,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  rarityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  lockedText: {
    color: COLORS.TEXT_DISABLED,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_VARIANT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  bottomPadding: {
    height: 20,
  },
});

export default AchievementsScreen;