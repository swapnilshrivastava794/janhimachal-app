import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, DimensionValue } from 'react-native';

interface NewsSkeletonProps {
  width?: DimensionValue;
}

export function NewsSkeleton({ width }: NewsSkeletonProps) {
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
    <View style={[styles.card, { borderColor: theme.borderColor, width: width || '100%' }]}>
      {/* Image Skeleton */}
      <Animated.View style={[styles.image, bgStyle]} />
      
      <View style={styles.content}>
        {/* Title Lines Skeleton */}
        <Animated.View style={[styles.line, bgStyle, { width: '90%', height: 20, marginBottom: 8 }]} />
        <Animated.View style={[styles.line, bgStyle, { width: '80%', height: 20, marginBottom: 8 }]} />
        
        {/* Meta Skeleton */}
        <View style={styles.metaContainer}>
           <Animated.View style={[styles.line, bgStyle, { width: 60, height: 12, borderRadius: 6 }]} />
           <Animated.View style={[styles.line, bgStyle, { width: 100, height: 12, borderRadius: 6, marginLeft: 8 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },
  image: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  line: {
    borderRadius: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 8,
  }
});
