import { getNews, getSubmissions, getVideos } from '@/api/server';
import { NewsCard } from '@/components/NewsCard';
import { NewsSkeleton } from '@/components/NewsSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { ToastNotification } from '@/components/ToastNotification';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCategory } from '@/context/CategoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Dimensions, FlatList, Image, InteractionManager, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { selectedSubcategoryId, selectedCategoryName, nextSubCategory, categories } = useCategory();
  const { user, parentProfile, refreshProfile } = useAuth();

  const [topStories, setTopStories] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [popularNews, setPopularNews] = useState<any[]>([]);
  const [articlesData, setArticlesData] = useState<any[]>([]);
  const [breakingSectionNews, setBreakingSectionNews] = useState<any[]>([]);
  const [nanhePatrakarStories, setNanhePatrakarStories] = useState<any[]>([]);
  const [videosData, setVideosData] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLongLoading, setShowLongLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  const [showUpdateBadge, setShowUpdateBadge] = useState(false);

  // Top Stories Pagination
  const [topStoriesPage, setTopStoriesPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreTopStories, setHasMoreTopStories] = useState(true);
  const MAX_TOP_STORIES_PAGE = 5;

  // FlatList ref
  const flatListRef = useRef<FlatList>(null);
  const initialCategoryRef = useRef<number | null>(null);

  // AppState tracking for background/foreground detection
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useRef<number>(Date.now());

  const isNanhePatrakar = user?.user_type === 'nanhe_patrakar';

  // Refresh profile data EVERY TIME Home screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        refreshProfile();
      }
    }, [user])
  );

  // AppState listener: Detect when app comes back from background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const timeInBackground = Date.now() - backgroundTimestamp.current;
        const minutesInBackground = timeInBackground / (1000 * 60);

        if (minutesInBackground >= 5) {
          setShowUpdateBadge(true);
          setToastMessage('नई खबरें उपलब्ध हैं!');
          setToastVisible(true);
        } else if (minutesInBackground >= 2) {
          fetchData(false);
        }
      }

      if (nextAppState.match(/inactive|background/)) {
        backgroundTimestamp.current = Date.now();
      }

      appState.current = nextAppState as any;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    fetchData();

    if (initialCategoryRef.current === null && selectedSubcategoryId) {
      initialCategoryRef.current = selectedSubcategoryId;
    } else if (initialCategoryRef.current !== null && selectedSubcategoryId !== initialCategoryRef.current) {
      if (flatListRef.current) {
        // Scroll to top of list when category changes
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 300);
      }

      setShowLongLoading(false);

      let subName = '';
      if (categories) {
        for (const cat of categories) {
          const sub = cat.sub_categories?.find((s: any) => s.id === selectedSubcategoryId);
          if (sub) {
            subName = sub.subcat_name;
            break;
          }
        }
      }
      if (subName) {
        setToastMessage(`Now reading: ${subName}`);
        setToastVisible(true);
      }
    }
  }, [selectedSubcategoryId]);

  const fetchData = async (useSkeleton = true) => {
    if (useSkeleton) setIsLoading(true);
    try {
      // Helper to fetch with fallback to 'latest' if empty
      const fetchSectionData = async (primaryParams: any, fallbackLimit: number = 5) => {
        try {
          // If no subcategory, remove it from params
          if (!selectedSubcategoryId) {
            delete primaryParams.subcategory_id;
          }

          const res = await getNews(primaryParams);
          const data = res.results || res || [];
          if (data.length > 0) return data;

          // Fallback logic also needs to respect no-category
          const fallbackParams: any = {
            latest: '1',
            limit: fallbackLimit
          };
          if (selectedSubcategoryId) {
            fallbackParams.subcategory_id = selectedSubcategoryId;
          }

          const fallbackRes = await getNews(fallbackParams);
          return fallbackRes.results || fallbackRes || [];
        } catch (e) {
          console.log("Section fetch error, trying fallback", e);
          const fallbackParams: any = {
            latest: '1',
            limit: fallbackLimit
          };
          if (selectedSubcategoryId) {
            fallbackParams.subcategory_id = selectedSubcategoryId;
          }
          const fallbackRes = await getNews(fallbackParams);
          return fallbackRes.results || fallbackRes || [];
        }
      };

      // Base params for main queries
      const baseParams: any = {};
      if (selectedSubcategoryId) {
        baseParams.subcategory_id = selectedSubcategoryId;
      }

      // Execute all requests in parallel
      const [
        topRes,
        recentData,
        trendingData,
        popularData,
        articlesSectionData,
        breakingRes,
        nanheRes,
        videoRes
      ] = await Promise.all([
        getNews({ ...baseParams, limit: 10 }),
        fetchSectionData(
          { ...baseParams, latest: '1', limit: 5, page: 2 },
          5
        ),
        fetchSectionData(
          { ...baseParams, trending: '1', latest: '1', limit: 5, page: 1 },
          5
        ),
        fetchSectionData(
          { ...baseParams, headlines: '1', trending: '1', limit: 5 },
          5
        ),
        fetchSectionData(
          { ...baseParams, articles: '1', limit: 10 },
        ),
        getNews({ ...baseParams, breaking: '1', limit: 5 }),
        getSubmissions({ status: 'Approved', limit: 5 }),
        getVideos({ ...baseParams, limit: 5 })
      ]);

      setTopStories(topRes.results || topRes || []);
      setRecentPosts(recentData);
      setTopPicks(trendingData);
      setPopularNews(popularData);
      setArticlesData(articlesSectionData);
      setBreakingSectionNews(breakingRes.results || breakingRes || []);
      setVideosData(videoRes.results || videoRes || []);

      setTopStoriesPage(1);
      setHasMoreTopStories(true);

      setLastFetchTime(Date.now());
      setShowUpdateBadge(false);

      if (nanheRes.data && nanheRes.data.status) {
        setNanhePatrakarStories(nanheRes.data.data.results || []);
      }

    } catch (e) {
      console.log('Error fetching home data:', e);
    } finally {
      if (useSkeleton) setIsLoading(false);
      setShowLongLoading(false);
    }
  };

  const loadMoreTopStories = async () => {
    if (isLoadingMore || !hasMoreTopStories || topStoriesPage >= MAX_TOP_STORIES_PAGE) {
      if (topStoriesPage >= MAX_TOP_STORIES_PAGE) {
        setHasMoreTopStories(false);
      }
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = topStoriesPage + 1;
      const params: any = {
        limit: 10,
        page: nextPage
      };
      if (selectedSubcategoryId) {
        params.subcategory_id = selectedSubcategoryId;
      }

      const res = await getNews(params);

      const newItems = res.results || res || [];

      if (newItems.length > 0) {
        InteractionManager.runAfterInteractions(() => {
          setTopStories(prev => [...prev, ...newItems]);
          setTopStoriesPage(nextPage);

          if (nextPage >= MAX_TOP_STORIES_PAGE) {
            setHasMoreTopStories(false);
          }
          setIsLoadingMore(false);
        });
      } else {
        setHasMoreTopStories(false);
        setIsLoadingMore(false);
      }
    } catch (e) {
      console.log('Error loading more top stories:', e);
      setIsLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTopStoriesPage(1);
    setHasMoreTopStories(true);
    await fetchData(false);
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      if (timeSinceLastFetch > 300000 && !isLoading && !refreshing) {
        setShowUpdateBadge(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastFetchTime, isLoading, refreshing]);

  const handleSmartReload = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowUpdateBadge(false);
    setTimeout(() => {
      onRefresh();
    }, 500);
  };

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowLongLoading(true);
      }, 2000);
    } else {
      setShowLongLoading(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleViewAll = (title: string, type: string) => {
    router.push({ pathname: '/post' as any, params: { title, type } });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "JUST NOW";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderHeader = () => (
    <View>
      {/* Dashboard Banner */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (!user) {
            router.push('/auth/login' as any);
          } else if (parentProfile) {
            router.push('/nanhe-patrakar-portfolio' as any);
          } else {
            router.push('/nanhe-patrakar-registration' as any);
          }
        }}
        style={{ margin: 16, marginBottom: 8, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#E31E24', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 }}
      >
        <LinearGradient
          colors={isNanhePatrakar ? ['#1e3c72', '#2a5298'] : ['#E31E24', '#8E0E00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <View style={{ backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>
                  {isNanhePatrakar ? 'MY DASHBOARD' : 'VOICE OF HIMACHAL'}
                </Text>
              </View>
            </View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>नन्हे पत्रकार</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
              {isNanhePatrakar
                ? 'अपना पोर्टफोलियो और आईडी कार्ड देखें'
                : 'क्या आपके बच्चे में है एक न्यूज़ रिपोर्टर?'}
            </Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <Ionicons
              name={isNanhePatrakar ? "id-card" : "mic-outline"}
              size={26}
              color="#FFD700"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Nanhe Patrakar Stories */}
      {nanhePatrakarStories.length > 0 && (
        <View style={[styles.sectionContainer, { marginBottom: 30 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ backgroundColor: theme.primary, width: 4, height: 20, borderRadius: 2 }} />
              <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text }}>नन्हे पत्रकारों की कलम से</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/nanhe-patrakar-hub' as any)}>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>View Hub</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={nanhePatrakarStories}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            renderItem={({ item: story }) => {
              const storyImg = story.media_files?.[0]?.file ? (story.media_files[0].file.startsWith('http') ? story.media_files[0].file : `${constant.appBaseUrl}${story.media_files[0].file}`) : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=300';
              return (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/nanhe-patrakar-reader', params: { id: story.id } } as any)}
                  style={{ width: width * 0.7, marginHorizontal: 8, backgroundColor: theme.card, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: theme.borderColor }}
                >
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: storyImg }} style={{ width: '100%', height: 140 }} />
                    <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="eye-outline" size={12} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{story.views || 0}</Text>
                    </View>
                  </View>
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: theme.primary, fontSize: 10, fontWeight: '800', marginBottom: 4 }}>{story.topic_title_hindi?.toUpperCase() || 'TOPIC'}</Text>
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: '800', marginBottom: 8 }} numberOfLines={2}>{story.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: theme.borderColor, paddingTop: 8 }}>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="person" size={14} color={theme.primary} />
                      </View>
                      <Text style={{ color: theme.placeholderText, fontSize: 11, fontWeight: '700' }}>By {story.child_name || 'Nanha Patrakar'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {/* 1. Breaking News Section (Horizontal) */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="ब्रेकिंग न्यूज़" onViewAll={() => handleViewAll('Breaking News', 'breaking')} />
        <FlatList
          horizontal
          data={breakingSectionNews}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <NewsCard
              title={item.post_title || item.title}
              image={item.image}
              category="BREAKING"
              author={item.posted_by || item.author}
              date={item.post_date || item.date}
              shareUrl={item.share_url}
              onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
              width={280}
            />
          )}
        />
      </View>

      {/* 2. Top Picks (Horizontal) */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="ट्रेंडिंग खबरें" onViewAll={() => handleViewAll('Top Picks', 'top_picks')} />
        <FlatList
          horizontal
          data={topPicks}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <NewsCard
              title={item.post_title || item.title}
              image={item.image}
              category="Top Pick"
              author={item.posted_by || item.author}
              date={item.post_date || item.date}
              shareUrl={item.share_url}
              onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
              width={300}
            />
          )}
        />
      </View>

      {/* 3. Videos (Horizontal) */}
      {videosData.length > 0 && (
        <View style={styles.sectionContainer}>
          <SectionHeader title="ताज़ा वीडियो" />
          <FlatList
            horizontal
            data={videosData}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => {
              const videoTitle = item.video_title || item.post_title || item.title;
              let image = item.thumbnail || item.image;
              const videoId = item.video_url;
              if (videoId && (!image || image.includes('na.jpg'))) {
                image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }

              return (
                <TouchableOpacity
                  style={{ width: 260, marginRight: 12 }}
                  onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id, type: 'video' } })}
                >
                  <View style={{ height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                    <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="play-circle" size={40} color="#fff" />
                    </View>
                  </View>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }} numberOfLines={2}>{videoTitle}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}


      {/* 4. Popular News (Horizontal) */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="लोकप्रिय खबरें" onViewAll={() => handleViewAll('Popular News', 'popular')} />
        <FlatList
          horizontal
          data={popularNews}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <NewsCard
              title={item.post_title || item.title}
              image={item.image}
              category="Popular"
              author={item.posted_by || item.author}
              date={item.post_date || item.date}
              shareUrl={item.share_url}
              onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
              width={280}
            />
          )}
        />
      </View>

      {/* 5. Recent News (Horizontal) */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="ताज़ा अपडेट" onViewAll={() => handleViewAll('Recent Posts', 'recent')} />
        <FlatList
          horizontal
          data={recentPosts}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <NewsCard
              title={item.post_title || item.title}
              image={item.image}
              category="Recent"
              author={item.posted_by || item.author}
              date={item.post_date || item.date}
              shareUrl={item.share_url}
              onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
              width={280}
            />
          )}
        />
      </View>

      {/* 6. Articles (Horizontal) */}
      {articlesData.length > 0 && (
        <View style={styles.sectionContainer}>
          <SectionHeader title="लेख और विश्लेषण" onViewAll={() => handleViewAll('Articles', 'articles')} />
          <FlatList
            horizontal
            data={articlesData}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <NewsCard
                title={item.post_title || item.title}
                image={item.image}
                category="Article"
                author={item.posted_by || item.author}
                date={item.post_date || item.date}
                shareUrl={item.share_url}
                onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                width={300}
              />
            )}
          />
        </View>
      )}

      {/* 7. Top Stories Header (Start of Vertical Feed) */}
      <View style={[styles.sectionContainer, { marginBottom: 0 }]}>
        {selectedCategoryName && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 8 }}>
            <View style={{ backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ color: colorScheme === 'dark' ? '#000' : '#fff', fontSize: 11, fontWeight: '800' }}>{selectedCategoryName}</Text>
            </View>
          </View>
        )}
        <SectionHeader
          title={`आज की बड़ी खबरें`}
          onViewAll={() => handleViewAll('Top Stories', 'top_stories')}
        />
      </View>
    </View>
  );

  const renderFooter = () => (
    <View>
      {/* Top Stories Loading State */}
      <View style={{ marginBottom: 30 }}>
        {hasMoreTopStories && (
          <View style={{ paddingVertical: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            {isLoadingMore ? (
              <>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={{ color: theme.text, fontWeight: '600', fontSize: 13 }}>Loading more news...</Text>
              </>
            ) : (
              <Text style={{ color: theme.placeholderText, fontSize: 12 }}>↓ Scroll for more news ({topStoriesPage}/{MAX_TOP_STORIES_PAGE})</Text>
            )}
          </View>
        )}
        {!hasMoreTopStories && topStoriesPage >= MAX_TOP_STORIES_PAGE && (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.placeholderText, fontSize: 12, fontWeight: '600' }}>✓ All Top Stories loaded</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {showUpdateBadge && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSmartReload}
          style={{
            position: 'absolute',
            top: 60,
            alignSelf: 'center',
            zIndex: 999,
            backgroundColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 30,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          <Ionicons name="reload-circle" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>New Feed Available</Text>
        </TouchableOpacity>
      )}

      {/* Main FlatList - Optimized for 120Hz */}
      {isLoading && topStories.length === 0 ? (
        // Initial Loading State
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: 60 }]}>
          {[1, 2, 3].map(i => <NewsSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={topStories}
          style={[styles.container, { backgroundColor: theme.background }]}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <NewsCard
                title={item.post_title || item.title}
                image={item.image}
                category={item.category || "News"}
                author={item.posted_by || item.author || "Unknown"}
                date={item.post_date || item.date}
                shareUrl={item.share_url}
                onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
              />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={() => {
            if (hasMoreTopStories && !isLoadingMore) {
              loadMoreTopStories();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          onMomentumScrollEnd={({ nativeEvent }) => {
            const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
              const paddingToBottom = 100;
              return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
            };
            if (isCloseToBottom(nativeEvent) && !hasMoreTopStories) {
              nextSubCategory();
            }
          }}
        />
      )}

      {/* Long Loading Indicator */}
      {showLongLoading && isLoading && (
        <View style={{ position: 'absolute', bottom: 80, alignSelf: 'center', backgroundColor: theme.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84, elevation: 5 }}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>Taking longer than usual... Please wait</Text>
        </View>
      )}

      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  breakingItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breakingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  breakingMeta: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
