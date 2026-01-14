import { getNews } from '@/api/server';
import { NewsCard } from '@/components/NewsCard';
import { NewsSkeleton } from '@/components/NewsSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCategory } from '@/context/CategoryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { selectedSubcategoryId, selectedCategoryName } = useCategory();
  const { user } = useAuth();
  
  const [topStories, setTopStories] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [popularNews, setPopularNews] = useState<any[]>([]);
  const [articlesData, setArticlesData] = useState<any[]>([]);
  const [breakingSectionNews, setBreakingSectionNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isNanhePatrakar = user?.user_type === 'nanhe_patrakar';

  useEffect(() => {
    fetchData();
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
      
      setBreakingSectionNews(mixedNews);

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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Dynamic Nanhe Patrakar Hub Banner */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
            if (!user) {
                router.push('/auth/login' as any);
            } else if (!isNanhePatrakar) {
                router.push('/nanhe-patrakar-registration' as any);
            } else {
                router.push('/nanhe-patrakar-portfolio' as any);
            }
        }}
        style={{ margin: 16, marginBottom: 8, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#E31E24', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 8 }}
      >
        <LinearGradient
            colors={isNanhePatrakar ? ['#1A237E', '#0D47A1'] : ['#E31E24', '#B71C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                            {isNanhePatrakar ? 'MY HUB' : 'NEW'}
                        </Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>नन्हे पत्रकार</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' }}>
                    {isNanhePatrakar 
                        ? 'अपना पोर्टफोलियो और प्रमाण पत्र देखें' 
                        : 'हिमाचल के बच्चों की नई आवाज़ • अभी जुड़ें'}
                </Text>
            </View>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons 
                    name={isNanhePatrakar ? "person-circle" : "arrow-forward"} 
                    size={24} 
                    color="#fff" 
                />
            </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* 1. Top Stories Section */}
      <View style={styles.sectionContainer}>
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
                        category={item.category || "UAE News"}
                        author={item.posted_by || item.author || "Unknown"}
                        date={item.post_date || item.date}
                        onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
                        width="100%" // Let parent control width
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
