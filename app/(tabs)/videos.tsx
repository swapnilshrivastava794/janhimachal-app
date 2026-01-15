import { getVideos } from '@/api/server';
import { NewsSkeleton } from '@/components/NewsSkeleton';
import { Colors } from '@/constants/theme';
import { useCategory } from '@/context/CategoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function VideoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { selectedSubcategoryId } = useCategory();

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset and fetch when category changes
  useEffect(() => {
    setPage(1);
    setVideos([]);
    setHasMore(true);
    fetchVideos(1, true);
  }, [selectedSubcategoryId]);

  const fetchVideos = async (pageNum: number, reset: boolean = false) => {
    if (loading && !reset) return;
    if (!hasMore && !reset) return; // Stop if no more data

    setLoading(true);
    try {
        const params = {
            subcategory_id: selectedSubcategoryId,
            page: pageNum,
            limit: 15
        };
        const res = await getVideos(params);
        const newHelper = res.results || res || [];
        
        if (reset) {
            setVideos(newHelper);
        } else {
             if (newHelper.length > 0) {
                 setVideos(prev => {
                     const existingIds = new Set(prev.map(item => item.id));
                     const uniqueNew = newHelper.filter((item: any) => !existingIds.has(item.id));
                     return [...prev, ...uniqueNew];
                 });
             }
        }

        if (newHelper.length < 15) {
            setHasMore(false);
        }

    } catch (error: any) {
        if (error.response && error.response.status === 404) {
             setHasMore(false);
        } else {
             console.log("Error fetching videos:", error);
        }
    } finally {
        setLoading(false);
    }
  };

  const loadMore = () => {
      if (!loading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchVideos(nextPage);
      }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    // Mapping API fields
    // Mapping API fields
    const title = item.video_title || item.post_title || item.title;
    const videoId = item.video_url; // This is the YouTube ID
    
    let image = item.thumbnail || item.image;
    // If thumbnail is missing or default 'na.jpg', use YouTube thumbnail
    if (videoId && (!image || image.includes('na.jpg'))) {
        image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    const category = item.subcategory || item.category || 'VIDEO';
    const date = formatDate(item.video_date || item.post_date || item.date);
    const author = item.posted_by || item.author || 'Jan Himachal';

    // Featured First Item
    if (index === 0) {
      return (
        <TouchableOpacity 
          style={styles.featuredContainer} 
          onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id, type: 'video' } })}
          activeOpacity={0.9}
        >
          <View style={styles.featuredImageContainer}>
            <Image source={{ uri: image }} style={styles.featuredImage} />
            <View style={styles.playButtonOverlay}>
                <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>FEATURED</Text>
            </View>
          </View>
          <View style={[styles.featuredContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.category, { color: theme.tint }]}>{category}</Text>
            <Text style={[styles.featuredTitle, { color: theme.text }]}>{title}</Text>
            <Text style={styles.metaText}>{date} • {author}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Standard Video List Items
    return (
      <TouchableOpacity 
        style={[styles.itemContainer, { backgroundColor: theme.background, borderColor: theme.borderColor }]} 
        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id, type: 'video' } })}
      >
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: image }} style={styles.itemImage} />
          <View style={styles.smallPlayOverlay}>
             <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.categorySmall, { color: theme.tint }]}>{category}</Text>
          <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
          <Text style={styles.metaTextSmall}>{date}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [theme, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Loading Skeleton (Initial Load) */}
      {loading && videos.length === 0 ? (
          <View style={{ padding: 16 }}>
              <NewsSkeleton />
              <NewsSkeleton />
              <NewsSkeleton />
          </View>
      ) : (
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={theme.text} style={{ padding: 20 }} /> : null}
        ListEmptyComponent={!loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                <Text style={{ color: theme.text, fontSize: 16 }}>No videos found.</Text>
            </View>
        ) : null}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 20,
  },
  // Featured Styles
  featuredContainer: {
    marginBottom: 24,
  },
  featuredImageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredContent: {
    padding: 16,
  },
  category: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  // List Item Styles
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  itemImageContainer: {
    position: 'relative',
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  smallPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categorySmall: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  metaTextSmall: {
    fontSize: 11,
    color: '#999',
  },
});
