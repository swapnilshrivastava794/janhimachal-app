import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { DimensionValue, Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NewsCardProps {
  id?: string | number;
  type?: 'post' | 'video';
  title: string;
  image: string;
  category: string;
  author: string;
  date: string;
  onPress?: () => void;
  width?: DimensionValue;
  // Share URL - directly from API
  shareUrl?: string;
}

export function NewsCard({ id, type = 'post', title, image, category, author, date, onPress, width, shareUrl }: NewsCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const imageUrl = image && image.startsWith('http') ? image : `${constant.appBaseUrl}/wp-content/uploads/2023/04/jan-himachal-logo.png`;
  const displayDate = date ? new Date(date).toLocaleDateString() : '';

  const handleShare = async () => {
      try {
          // Use share_url from API directly, fallback to constructed URL
          const url = shareUrl || `${constant.appBaseUrl}/${type}/${id}`;
          
          await Share.share({
              message: `${title}\n\nRead more: ${url}`,
              url: url,
              title: title
          });
      } catch (error: any) {
          console.log(error.message);
      }
  };

  return (
    <TouchableOpacity 
      style={[
          styles.card, 
          { backgroundColor: theme.background, borderColor: theme.borderColor, width: width || '100%' }
      ]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      
      {/* Category Overlay Pill */}
      

      {/* Share Button Overlay */}
      <TouchableOpacity 
          style={styles.shareBtn} 
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
          <Ionicons name="share-social" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={3}>{title}</Text>
        <View style={styles.metaContainer}>
          <Text style={[styles.metaText, { color: theme.icon }]}>{"Jan Himachal"} • {displayDate || date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  shareBtn: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
  },
  // ... existing styles ...
  card: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 0, // Removed border for cleaner look, shadow handles it
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 26,
    letterSpacing: 0.3,
    minHeight: 78, // Enforce 3 lines height (26 * 3)
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
