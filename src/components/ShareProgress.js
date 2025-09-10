import React from 'react';
import { Alert, Share } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ShareProgress = () => {
  const { user } = useAuth();

  const shareText = async () => {
    try {
      const message = `Trash Clean Progress:
      
${user?.points || 0} points
${user?.totalCleanups || 0} cleanups completed
${user?.totalReports || 0} locations reported
${user?.streakDays ? `${user.streakDays} day streak` : ''}

#TrashClean`;

      const result = await Share.share({
        message,
        title: 'My Trash Clean Progress',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share progress. Please try again.');
    }
  };

  const shareProgressCard = async () => {
    try {
      // Share progress as formatted text instead of image
      const progressMessage = `Trash Clean Progress:

Level: ${user?.rank || 'Beginner'}
Points: ${user?.points || 0}
Cleanups: ${user?.totalCleanups || 0}
Reports: ${user?.totalReports || 0}
${user?.streakDays ? `${user.streakDays} day streak` : 'Building streak'}

#TrashClean`;

      const result = await Share.share({
        message: progressMessage,
        title: 'My Trash Clean Progress',
      });

      if (result.action === Share.sharedAction) {
        console.log('Progress card shared successfully');
      }
    } catch (error) {
      console.error('Error sharing progress card:', error);
      Alert.alert('Error', 'Failed to share progress. Please try again.');
    }
  };

  const shareAchievement = async (achievement) => {
    try {
      const message = `Achievement: ${achievement.title}
      
${achievement.description}

${achievement.points} points earned

#TrashClean`;

      const result = await Share.share({
        message,
        title: `Achievement: ${achievement.title}`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Achievement shared successfully');
      }
    } catch (error) {
      console.error('Error sharing achievement:', error);
      Alert.alert('Error', 'Failed to share achievement. Please try again.');
    }
  };

  const shareCleanupComplete = async (cleanupData) => {
    try {
      const { pointsEarned = 0, location = '', trashType = 'trash' } = cleanupData;
      
      const message = `Cleanup completed
      
Picked up ${trashType} ${location ? `at ${location}` : ''}
Earned ${pointsEarned} points

#TrashClean`;

      const result = await Share.share({
        message,
        title: 'Cleanup Complete!',
      });

      if (result.action === Share.sharedAction) {
        console.log('Cleanup completion shared successfully');
      }
    } catch (error) {
      console.error('Error sharing cleanup:', error);
      Alert.alert('Error', 'Failed to share cleanup completion. Please try again.');
    }
  };

  const shareLeaderboardPosition = async (rank, points) => {
    try {
      const message = `Leaderboard Position:
      
Rank: #${rank}
Points: ${points}
${getRankTitle(rank)} status

#TrashClean`;

      const result = await Share.share({
        message,
        title: 'My Leaderboard Position',
      });

      if (result.action === Share.sharedAction) {
        console.log('Leaderboard position shared successfully');
      }
    } catch (error) {
      console.error('Error sharing leaderboard:', error);
      Alert.alert('Error', 'Failed to share leaderboard position. Please try again.');
    }
  };

  const shareAppInvite = async () => {
    try {
      const message = `Trash Clean App

Report trash locations
Complete cleanup missions
Earn points and achievements
Join the community

Download Trash Clean

#TrashClean`;

      const result = await Share.share({
        message,
        title: 'Join me on Trash Clean!',
      });

      if (result.action === Share.sharedAction) {
        console.log('App invite shared successfully');
      }
    } catch (error) {
      console.error('Error sharing app invite:', error);
      Alert.alert('Error', 'Failed to share app invite. Please try again.');
    }
  };

  const getRankTitle = (rank) => {
    if (rank === 1) return 'Champion';
    if (rank <= 3) return 'Elite';
    if (rank <= 10) return 'Expert';
    if (rank <= 50) return 'Advanced';
    return 'Rising';
  };

  return {
    shareText,
    shareProgressCard,
    shareAchievement,
    shareCleanupComplete,
    shareLeaderboardPosition,
    shareAppInvite,
  };
};

export default ShareProgress;