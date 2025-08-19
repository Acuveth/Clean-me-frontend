import React from 'react';
import { Alert, Share } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ShareProgress = () => {
  const { user } = useAuth();

  const shareText = async () => {
    try {
      const message = `🌍 I'm making a difference with Trash Clean! 
      
🏆 ${user?.points || 0} points earned
🗑️ ${user?.totalCleanups || 0} trash items cleaned up
📍 ${user?.totalReports || 0} locations reported
${user?.streakDays ? `🔥 ${user.streakDays} day streak!` : ''}

Join me in cleaning up our environment! 💚

#TrashClean #Environment #CleanUp #MakeADifference`;

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
      const progressMessage = `📊 My Trash Clean Progress Card 📊

🏆 Level: ${user?.rank || 'Beginner'}
⭐ Points: ${user?.points || 0}
🗑️ Cleanups: ${user?.totalCleanups || 0}
📍 Reports: ${user?.totalReports || 0}
${user?.streakDays ? `🔥 ${user.streakDays} day streak!` : '🔥 Building my streak!'}

Making our world cleaner, one pickup at a time! 🌍♻️

Join me on Trash Clean! #TrashClean #Environment #CleanUp`;

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
      const message = `🏆 Achievement Unlocked! 
      
"${achievement.title}"
${achievement.description}

⭐ ${achievement.points} points earned!

Making a difference with Trash Clean! 🌍♻️

#TrashClean #Achievement #Environment #CleanUp`;

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
      
      const message = `🎉 Just completed another cleanup! 
      
🗑️ Picked up ${trashType} ${location ? `at ${location}` : ''}
⭐ Earned ${pointsEarned} points!
🌍 Every small action makes a big difference!

Join me in cleaning up our environment with Trash Clean! 💚

#TrashClean #Environment #CleanUp #CommunityService`;

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
      const message = `🏅 Check out my Trash Clean leaderboard position!
      
📊 Rank: #${rank}
⭐ Points: ${points}
🌟 ${getRankTitle(rank)} status achieved!

Every cleanup counts! Join me in making our world cleaner! 🌍♻️

#TrashClean #Leaderboard #Environment #CleanUp`;

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
      const message = `🌍 Join me in making a difference!

I'm using Trash Clean to help clean up our environment and it's amazing! 

✨ Report trash locations
🗑️ Complete cleanup missions
🏆 Earn points and achievements
👥 Join a community of eco-warriors

Download Trash Clean and let's clean up our world together! 💚

#TrashClean #Environment #CleanUp #MakeADifference`;

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