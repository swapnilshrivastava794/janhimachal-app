import { NewsCard } from '@/components/NewsCard';
import { TopPickCard } from '@/components/TopPickCard';
import { BREAKING_NEWS, POPULAR_NEWS, RECENT_POSTS, TOP_PICKS, TOP_STORIES } from '@/constants/news-data';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getNews } from '@/api/server';
import { useCategory } from '@/context/CategoryContext';

const { width } = Dimensions.get('window');

export default function PostIndexScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = params.title as string || 'News';
  const type = params.type as string; // 'top_stories', 'recent', etc.
  
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const { selectedSubcategoryId } = useCategory();
  const [newsData, setNewsData] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const isBreaking = type === 'breaking';

  React.useEffect(() => {
    // Reset and fetch when type or title changes
    setNewsData([]);
    setPage(1);
    setHasMore(true);
    fetchNews(1);
  }, [type, selectedSubcategoryId]);

  const fetchNews = async (pageNum: number) => {
    if (loading) return; 
    setLoading(true);
    try {
        let params: any = { 
            limit: 20, 
            page: pageNum,
            subcategory_id: selectedSubcategoryId
        };

        // Param mapping based on type
        switch(type) {
            case 'recent': 
                params.latest = '1';
                break;
            case 'top_picks':
                params.trending = '1';
                break;
            case 'popular':
                params.headlines = '1';
                params.trending = '1';
                break;
            case 'articles':
                params.articles = '1';
                params.trending = '1';
                params.latest = '1';
                break;
            case 'breaking':
                // For View All Breaking, we prioritize Latest since "Mixed" is hard to paginate.
                // Or we can use HeadLines.
                // Let's use Latest for infinite scroll consistency.
                params.latest = '1'; 
                break;
            case 'top_stories':
            default:
                // Default params are fine
                break;
        }

        const res = await getNews(params);
        const newItems = res.results || res || [];
        
        if (newItems.length < 10) {
            setHasMore(false);
        }

        setNewsData(prev => pageNum === 1 ? newItems : [...prev, ...newItems]);
    } catch (error) {
        console.log("Error fetching post index:", error);
    } finally {
        setLoading(false);
    }
  };

  const loadMore = () => {
      if (!loading && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNews(nextPage);
      }
  };

  // Render the large "Hero" card for the first item (if not breaking news)
  const renderHeader = React.useCallback(() => {
    // If breaking news (no images) or empty, no hero
    if (isBreaking || newsData.length === 0) return null;
    
    // Use the first item as Hero
    const heroItem = newsData[0] as any; 
    
    // Safety check for image
    if (!heroItem.image) return null;

    return (
      <TouchableOpacity onPress={() => router.push({ pathname: '/post/[id]', params: { id: heroItem.id } })} activeOpacity={0.9}>
        <View style={styles.heroContainer}>
            <Image source={{ uri: heroItem.image }} style={styles.heroImage} />
            <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
            >
            <View style={styles.heroContent}>
                <Text style={styles.heroCategory}>{heroItem.category || 'News'}</Text>
                <Text style={styles.heroTitle}>{heroItem.post_title || heroItem.title}</Text>
                <View style={styles.heroMetaRow}>
                    <Text style={styles.heroAuthor}>{heroItem.posted_by || heroItem.author || "Unknown"}</Text>
                    <Text style={styles.heroDate}>{heroItem.post_date || heroItem.date}</Text>
                </View>
            </View>
            </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  }, [isBreaking, newsData, router]);

  const renderItem = React.useCallback(({ item, index }: { item: any, index: number }) => {
     // Skip the first item if we rendered it as a Hero (except for breaking where we don't have hero)
     if (!isBreaking && index === 0) return null;

     if (isBreaking) {
         return (
            <View style={[styles.breakingItem, { borderBottomColor: theme.borderColor }]}>
                <View style={styles.breakingIconRow}>
                    <View style={styles.breakingDot} />
                    <Text style={[styles.breakingMeta, { color: theme.accent }]}>BREAKING NOW</Text>
                </View>
                <Text style={[styles.breakingTitle, { color: theme.text }]}>{item.post_title || item.title}</Text>
            </View>
         );
     }



     // Standard News Card for everything else
     return (
        <NewsCard
            title={item.post_title || item.title}
            image={item.image}
            category={item.category || 'News'}
            author={item.posted_by || item.author}
            date={item.post_date || item.date}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
        />
     );
  }, [isBreaking, type, theme, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Rich White Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderColor }]}>
        <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="search" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>
        </View>
        
        <View style={styles.headerTitleRow}>
            {/* User requested full show, less bold */}
            <Text style={[styles.headerTitle, { color: theme.text }]}>
                {title}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.tabIconDefault }]}>
                {new Date().toDateString().toUpperCase()} • DAILY UPDATES
            </Text>
        </View>

        
      </View>

      {loading && newsData.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.text} />
          </View>
      ) : (
          <FlatList
            data={newsData}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[styles.listContent, !isBreaking && { paddingTop: 0 }]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading && page > 1 ? <ActivityIndicator size="small" color={theme.text} style={{ padding: 20 }} /> : null}
            
            // Performance Props
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRight: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleRow: {
    paddingLeft: 4,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600', // Reduced from 800 (Extra Bold) to 600 (Semi Bold)
    letterSpacing: 0.5,
    marginBottom: 4,
    lineHeight: 34, // Added line height for multi-line support
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  // Filter Bar Styles
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', // Light grey for inactive
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: '#000', // Black for active
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    paddingBottom: 40,
  },
  // Hero Styles
  heroContainer: {
    width: width,
    height: 400,
    marginBottom: 24,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    marginBottom: 20,
  },
  heroCategory: {
    color: '#FF3B30', // Or theme accent
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAuthor: {
    color: '#e0e0e0',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
  },
  heroDate: {
    color: '#bdbdbd',
    fontSize: 12,
  },
  // Breaking Styles
  breakingItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breakingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  breakingMeta: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  breakingTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
});
