import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TopPickCardProps {
  rank: number;
  title: string;
  author: string;
  date: string;
  imageUrl: string;
  onPress?: () => void;
}

export function TopPickCard({ rank, title, author, date, imageUrl, onPress }: TopPickCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.container, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.rank, { color: 'rgba(0,0,0,0.1)' }]}>{rank}</Text>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{title}</Text>
          <View style={styles.metaContainer}>
              <Text style={[styles.metaText, { color: theme.accent }]}>BY {author.toUpperCase()}</Text>
              <Text style={[styles.metaText, { color: theme.icon }]}> | {date}</Text>
          </View>
        </View>
        <Image source={{ uri: imageUrl }} style={styles.image} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rank: {
    fontSize: 60,
    fontWeight: '900',
    marginRight: 12,
    lineHeight: 70, // Adjust to align with text top
    fontFamily: 'System', // Or a serif font if available
  },
  content: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
    height: '100%',
    paddingTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginTop: 10,
  },
});
