import { getNews, getSubmissions } from '@/api/server';
import { NewsCard } from '@/components/NewsCard';
import { NewsSkeleton } from '@/components/NewsSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
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
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { selectedSubcategoryId, selectedCategoryName } = useCategory();
  const { user, parentProfile, refreshProfile } = useAuth();
  
  const [topStories, setTopStories] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [popularNews, setPopularNews] = useState<any[]>([]);
  const [articlesData, setArticlesData] = useState<any[]>([]);
  const [breakingSectionNews, setBreakingSectionNews] = useState<any[]>([]);
  const [nanhePatrakarStories, setNanhePatrakarStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ScrollView ref for auto-scrolling when category changes
  const scrollViewRef = useRef<ScrollView>(null);
  const topStoriesYPosition = useRef(0);
  const initialCategoryRef = useRef<number | null>(null);

  const isNanhePatrakar = user?.user_type === 'nanhe_patrakar';

  // Refresh profile data EVERY TIME Home screen comes into focus (not just mount)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('🏠 Home Screen Focused - Refreshing Profile...');
        refreshProfile();
      }
    }, [user])
  );

  useEffect(() => {
    fetchData();
    
    // Track if this is default view or user changed category
    if (initialCategoryRef.current === null && selectedSubcategoryId) {
      // First load - save the initial category
      initialCategoryRef.current = selectedSubcategoryId;
    } else if (initialCategoryRef.current !== null && selectedSubcategoryId !== initialCategoryRef.current) {
      // User changed category - auto scroll to news section
      if (scrollViewRef.current && topStoriesYPosition.current > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: topStoriesYPosition.current - 10, animated: true });
        }, 300);
      }
    }
  }, [selectedSubcategoryId]); // Refetch when subcategory changes

  const fetchData = async () => {
    if (!selectedSubcategoryId) return;
    setIsLoading(true);
    try {
      // Helper to fetch with fallback to 'latest' if empty
      const fetchSectionData = async (primaryParams: any, fallbackLimit: number = 5) => {
          try {
              const res = await getNews(primaryParams);
              const data = res.results || res || [];
              if (data.length > 0) return data;
              
              const fallbackRes = await getNews({ 
                  subcategory_id: selectedSubcategoryId, 
                  latest: '1', 
                  limit: fallbackLimit 
              });
              return fallbackRes.results || fallbackRes || [];
          } catch (e) {
              console.log("Section fetch error, trying fallback", e);
              const fallbackRes = await getNews({ 
                  subcategory_id: selectedSubcategoryId, 
                  latest: '1', 
                  limit: fallbackLimit 
              });
              return fallbackRes.results || fallbackRes || [];
          }
      };

      const topRes = await getNews({ subcategory_id: selectedSubcategoryId, limit: 10 });
      setTopStories(topRes.results || topRes || []);

      const recentData = await fetchSectionData(
          { subcategory_id: selectedSubcategoryId, latest: '1', headlines: '1', limit: 5 }, 
          5
      );
      setRecentPosts(recentData);

      const trendingData = await fetchSectionData(
          { subcategory_id: selectedSubcategoryId, trending: '1', limit: 5 },
          5
      );
      setTopPicks(trendingData);

      const popularData = await fetchSectionData(
          { subcategory_id: selectedSubcategoryId, headlines: '1', trending: '1', limit: 5 },
          5
      );
      setPopularNews(popularData);

      const articlesSectionData = await fetchSectionData(
          { subcategory_id: selectedSubcategoryId, articles: '1', trending: '1', latest: '1', limit: 10 },
          10
      );
      setArticlesData(articlesSectionData);

      const [latestMixRes, trendingMixRes] = await Promise.all([
          getNews({ subcategory_id: selectedSubcategoryId, latest: '1', limit: 4 }),
          getNews({ subcategory_id: selectedSubcategoryId, trending: '1', limit: 4 })
      ]);
      
      const latestItems = latestMixRes.results || latestMixRes || [];
      const trendingItems = trendingMixRes.results || trendingMixRes || [];
      
      const mixedMap = new Map();
      [...latestItems, ...trendingItems].forEach(item => {
          mixedMap.set(item.id, item);
      });
      const mixedNews = Array.from(mixedMap.values());
      const breakingRes = await getNews({ subcategory_id: selectedSubcategoryId, breaking: '1', limit: 5 });
      setBreakingSectionNews(breakingRes.results || breakingRes || []);
      
      // Fetch Nanhe Patrakar Spotlight Stories
      const nanheRes = await getSubmissions({ status: 'Approved', limit: 5 });
      if (nanheRes.data && nanheRes.data.status) {
          setNanhePatrakarStories(nanheRes.data.data.results || []);
      }

    } catch (e) {
      console.log('Error fetching home data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = (title: string, type: string) => {
    router.push({ pathname: '/post' as any, params: { title, type } });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "JUST NOW";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      
      {/* Cinematic Nanhe Patrakar Dash Banner */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
            if (!user) {
                // Not logged in - go to login
                router.push('/auth/login' as any);
            } else if (parentProfile) {
                // Has parent profile (enrolled) - go to portfolio (for payment or viewing)
                router.push('/nanhe-patrakar-portfolio' as any);
            } else {
                // Logged in but no parent profile - go to registration
                router.push('/nanhe-patrakar-registration' as any);
            }
        }}
        style={{ margin: 16, marginBottom: 8, borderRadius: 20, overflow: 'hidden', elevation: 8, shadowColor: '#E31E24', shadowOffset: {width:0, height:6}, shadowOpacity: 0.4, shadowRadius: 12 }}
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

      {/* Impact Stats Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 20, backgroundColor: theme.card, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: theme.borderColor }}>
          <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: theme.primary }}>5,000+</Text>
              <Text style={{ fontSize: 9, color: theme.placeholderText, fontWeight: '700' }}>सक्रिय पत्रकार</Text>
          </View>
          <View style={{ width: 1, height: '80%', backgroundColor: theme.borderColor, alignSelf: 'center' }} />
          <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: theme.primary }}>10,000+</Text>
              <Text style={{ fontSize: 9, color: theme.placeholderText, fontWeight: '700' }}>खबरें प्रकाशित</Text>
          </View>
          <View style={{ width: 1, height: '80%', backgroundColor: theme.borderColor, alignSelf: 'center' }} />
          <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: theme.primary }}>50+</Text>
              <Text style={{ fontSize: 9, color: theme.placeholderText, fontWeight: '700' }}>ज़िले कवर</Text>
          </View>
      </View>

      {/* Nanhe Patrakar Spotlight Section */}
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

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                  {nanhePatrakarStories.map((story) => {
                      const storyImg = story.media_files?.[0]?.file ? (story.media_files[0].file.startsWith('http') ? story.media_files[0].file : `${constant.appBaseUrl}${story.media_files[0].file}`) : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=300';
                      return (
                          <TouchableOpacity 
                            key={story.id}
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
                  })}
              </ScrollView>
          </View>
      )}

      {/* 1. Top Stories Section */}
      <View 
        style={styles.sectionContainer}
        onLayout={(event) => {
          topStoriesYPosition.current = event.nativeEvent.layout.y;
        }}
      >
        {/* Category Indicator */}
        {selectedCategoryName && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 8 }}>
            <View style={{ backgroundColor: theme.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{selectedCategoryName}</Text>
            </View>
            <Text style={{ color: theme.placeholderText, fontSize: 11 }}>की खबरें</Text>
          </View>
        )}
        <SectionHeader 
            title={`Top Stories and Breaking News in ${selectedCategoryName || 'UAE News'}`} 
            onViewAll={() => handleViewAll('Top Stories', 'top_stories')} 
        />
        <View style={{ minHeight: 200, justifyContent: 'center' }}>
            {isLoading ? (
                 <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sliderContent}
                 >
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={{ width: width * 0.85, marginHorizontal: 8 }}>
                            <NewsSkeleton width="100%" />
                        </View>
                    ))}
                 </ScrollView>
            ) : (
             <View>
                <ScrollView 
                horizontal 
                decelerationRate="fast"
                snapToInterval={width * 0.85 + 16} // Window width + margins
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sliderContent}
                >
                {topStories.map((item) => (
                    <View key={item.id} style={{ width: width * 0.85, marginHorizontal: 8 }}>
                    <NewsCard
                        title={item.post_title || item.title}
                        image={item.image}
                        category={item.category || "News"}
                        author={item.posted_by || item.author || "Unknown"}
                        date={item.post_date || item.date}
                        shareUrl={item.share_url}
                        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                        width="100%"
                    />
                    </View>
                ))}
                </ScrollView>
            </View>
            )}
        </View>
      </View>

      {/* 2. Recent Post Section */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="Recent Post" onViewAll={() => handleViewAll('Recent Posts', 'recent')} />
        <View style={{ minHeight: 100, justifyContent: 'center', paddingHorizontal: 16 }}>
            {isLoading ? (
                [1, 2].map(i => <NewsSkeleton key={i} />)
            ) : (
                <View>
                    {recentPosts.map((item) => (
                    <NewsCard
                        key={item.id}
                        title={item.post_title || item.title}
                        image={item.image}
                        category={item.category || "Recent"}
                        author={item.posted_by || item.author || "Unknown"}
                        date={item.post_date || item.date}
                        shareUrl={item.share_url}
                        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                    />
                    ))}
                </View>
            )}
        </View>
      </View>

      {/* 3. Top Picks Section */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="Top Picks" onViewAll={() => handleViewAll('Top Picks', 'top_picks')} />
        <View style={{ minHeight: 100, justifyContent: 'center', paddingHorizontal: 16 }}>
            {isLoading ? (
                [1, 2].map(i => <NewsSkeleton key={i} />)
            ) : (
                <View>
                    {topPicks.map((item) => (
                    <NewsCard
                        key={item.id}
                        title={item.post_title || item.title}
                        image={item.image}
                        category="Top Pick" 
                        author={item.posted_by || item.author || "Unknown"}
                        date={item.post_date || item.date}
                        shareUrl={item.share_url}
                        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                    />
                    ))}
                </View>
            )}
        </View>
      </View>

      {/* 4. Popular News Section */}
      {(isLoading || popularNews.length > 0) && (
      <View style={styles.sectionContainer}>
        <SectionHeader title="Popular News" onViewAll={() => handleViewAll('Popular News', 'popular')} />
        <View style={{ minHeight: 100, justifyContent: 'center', paddingHorizontal: 16 }}>
            {isLoading ? (
                [1, 2].map(i => <NewsSkeleton key={i} />)
            ) : (
                <View>
                    {popularNews.map((item) => (
                    <NewsCard
                        key={item.id}
                        title={item.post_title || item.title}
                        image={item.image}
                        category={item.category || "Popular"}
                        author={item.posted_by || item.author || "Unknown"}
                        date={item.post_date || item.date}
                        shareUrl={item.share_url}
                        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                    />
                    ))}
                </View>
            )}
        </View>
      </View>
      )}

      {/* 5. Articles Section */}
      <View style={styles.sectionContainer}>
        <SectionHeader title="Articles" onViewAll={() => handleViewAll('Articles', 'articles')} />
        <View style={{ minHeight: 100, justifyContent: 'center', paddingHorizontal: 16 }}>
             {isLoading ? (
                [1, 2, 3].map(i => <NewsSkeleton key={i} />)
             ) : (
                <View>
                    {articlesData.map((item) => (
                    <NewsCard
                        key={item.id}
                        title={item.post_title || item.title}
                        image={item.image}
                        category="Article"
                        author={item.posted_by || item.author || "Unknown"}
                        date={item.post_date || item.date}
                        shareUrl={item.share_url}
                        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                    />
                    ))}
                     {articlesData.length === 0 && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: theme.icon }}>No articles found.</Text>
                        </View>
                    )}
                </View>
             )}
        </View>
      </View>

      {/* 5. Breaking News Section */}
      <View style={[styles.sectionContainer, { paddingBottom: 40 }]}>
        <SectionHeader title="Breaking News" onViewAll={() => handleViewAll('Breaking News', 'breaking')} />
        <View style={{ minHeight: 100, justifyContent: 'center' }}>
            <View style={{ opacity: isLoading ? 0.4 : 1 }}>
                {breakingSectionNews.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}>
                    <View style={[styles.breakingItem, { borderBottomColor: theme.borderColor }]}>
                        <Text style={[styles.breakingTitle, { color: theme.text }]}>{item.post_title || item.title}</Text>
                        <Text style={[styles.breakingMeta, { color: theme.accent }]}>BREAKING • {formatDate(item.post_date || item.date)}</Text>
                    </View>
                </TouchableOpacity>
                ))}
            </View>
            {isLoading && (
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 1 }]}>
                    <ActivityIndicator size="small" color={theme.text} />
                </View>
            )}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  mainHeader: {
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    lineHeight: 30,
  },
  horizontalList: {
    paddingHorizontal: 16,
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
  sliderContent: {
    paddingHorizontal: 8,
  },
  sliderItem: {
    width: width - 32, // Full width minus padding
    marginHorizontal: 8,
  },
});
