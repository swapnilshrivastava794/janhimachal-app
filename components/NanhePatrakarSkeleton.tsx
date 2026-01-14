import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const bgStyle = { backgroundColor: theme.borderColor, opacity };

  return (
    <View style={[styles.profileCard, { borderColor: theme.borderColor }]}>
      {/* Avatar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Animated.View style={[styles.avatar, bgStyle]} />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Animated.View style={[bgStyle, { width: '70%', height: 22, borderRadius: 6, marginBottom: 8 }]} />
          <Animated.View style={[bgStyle, { width: '90%', height: 14, borderRadius: 4, marginBottom: 6 }]} />
          <Animated.View style={[bgStyle, { width: '50%', height: 12, borderRadius: 4 }]} />
        </View>
      </View>
      
      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statBox}>
            <Animated.View style={[bgStyle, { width: 40, height: 24, borderRadius: 6, marginBottom: 6 }]} />
            <Animated.View style={[bgStyle, { width: 60, height: 10, borderRadius: 4 }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Story Card Skeleton
export function StoryCardSkeleton() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const bgStyle = { backgroundColor: theme.borderColor, opacity };

  return (
    <View style={[styles.storyCard, { borderColor: theme.borderColor }]}>
      <Animated.View style={[styles.storyImage, bgStyle]} />
      <View style={styles.storyContent}>
        <Animated.View style={[bgStyle, { width: '40%', height: 10, borderRadius: 4, marginBottom: 8 }]} />
        <Animated.View style={[bgStyle, { width: '90%', height: 16, borderRadius: 4, marginBottom: 6 }]} />
        <Animated.View style={[bgStyle, { width: '70%', height: 16, borderRadius: 4 }]} />
      </View>
    </View>
  );
}

// ID Card Skeleton
export function IDCardSkeleton() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const bgStyle = { backgroundColor: theme.borderColor, opacity };

  return (
    <View style={[styles.idCard, { borderColor: theme.borderColor }]}>
      {/* Header */}
      <Animated.View style={[bgStyle, { width: '100%', height: 50, borderRadius: 0 }]} />
      
      {/* Photo & Info */}
      <View style={{ flexDirection: 'row', padding: 15, gap: 15 }}>
        <Animated.View style={[bgStyle, { width: 80, height: 100, borderRadius: 8 }]} />
        <View style={{ flex: 1 }}>
          <Animated.View style={[bgStyle, { width: '80%', height: 18, borderRadius: 4, marginBottom: 10 }]} />
          <Animated.View style={[bgStyle, { width: '60%', height: 12, borderRadius: 4, marginBottom: 8 }]} />
          <Animated.View style={[bgStyle, { width: '70%', height: 12, borderRadius: 4, marginBottom: 8 }]} />
          <Animated.View style={[bgStyle, { width: '50%', height: 12, borderRadius: 4 }]} />
        </View>
      </View>
      
      {/* QR Code */}
      <View style={{ alignItems: 'center', paddingBottom: 15 }}>
        <Animated.View style={[bgStyle, { width: 80, height: 80, borderRadius: 8 }]} />
      </View>
    </View>
  );
}

// Full Portfolio Loading Screen
export function PortfolioSkeleton() {
  return (
    <View style={styles.container}>
      <ProfileCardSkeleton />
      
      {/* Section Title */}
      <View style={{ marginTop: 20, marginBottom: 15, paddingHorizontal: 5 }}>
        <View style={{ width: 150, height: 18, backgroundColor: '#e0e0e0', borderRadius: 4, opacity: 0.5 }} />
      </View>
      
      {/* Story Cards */}
      <StoryCardSkeleton />
      <StoryCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  storyCard: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 15,
  },
  storyImage: {
    width: '100%',
    height: 140,
  },
  storyContent: {
    padding: 12,
  },
  idCard: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
