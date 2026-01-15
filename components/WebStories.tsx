import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Static Data for Web Stories
const STATIC_STORIES = [
  {
    id: '1',
    user: 'Jan Himachal',
    avatar: 'https://img.freepik.com/free-vector/breaking-news-concept_23-2148514216.jpg',
    items: [
      { id: 's1', type: 'image', url: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg', duration: 3000 },
      { id: 's2', type: 'image', url: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg', duration: 3000 },
    ]
  },
  {
    id: '2',
    user: 'UAE Updates',
    avatar: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg',
    items: [
       { id: 's3', type: 'image', url: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg', duration: 3000 },
    ]
  },
  {
    id: '3',
    user: 'Tech World',
    avatar: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    items: [
       { id: 's4', type: 'image', url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', duration: 3000 },
       { id: 's5', type: 'image', url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg', duration: 3000 },
    ]
  },
  {
    id: '4',
    user: 'Travel',
    avatar: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
    items: [
       { id: 's6', type: 'image', url: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg', duration: 3000 },
    ]
  },
  {
    id: '5',
    user: 'Lifestyle',
    avatar: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg',
    items: [
        { id: 's7', type: 'image', url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', duration: 3000 },
    ]
  }
];

export function WebStories() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleStoryPress = (index: number) => {
    // Navigate to story viewer, passing index or ID
    // We'll assume the viewer can handle logic.
    // For now simple push.
    router.push({
        pathname: '/story-viewer',
        params: { initialIndex: index }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {STATIC_STORIES.map((story, index) => (
          <TouchableOpacity 
            key={story.id} 
            style={styles.storyContainer}
            onPress={() => handleStoryPress(index)}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarBorder, { borderColor: theme.tint }]}>
                <Image source={{ uri: story.avatar }} style={styles.avatar} />
            </View>
            <Text 
                style={[styles.userText, { color: theme.text }]} 
                numberOfLines={1}
            >
                {story.user}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  avatarBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    padding: 2, // Space between border and image
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#eee',
  },
  userText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
