import { getNews, getNewsDetail, getVideoDetail, getVideos } from '@/api/server';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Linking, ScrollView, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import YoutubePlayer from "react-native-youtube-iframe";

import constant from '@/constants/constant';

const { width: screenWidth } = Dimensions.get('window');
const WEB_BASE_URL = constant.appBaseUrl;

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams(); // Get 'type' param
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width } = useWindowDimensions();
  
  const [article, setArticle] = React.useState<any>(null);
  const [relatedNews, setRelatedNews] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
        fetchDetails();
    }
  }, [id, type]);

  /* --- Share Handlers --- */
  const getShareUrl = () => {
      // Use share_url from API if available
      if (!article) return WEB_BASE_URL;
      return article.share_url || `${WEB_BASE_URL}/${article.slug || article.id}`;
  };

  const shareToWhatsApp = () => {
      const url = getShareUrl();
      const text = `Check this out! ${url}`;
      Linking.openURL(`whatsapp://send?text=${encodeURIComponent(text)}`);
  };

  const shareToTelegram = () => {
      const url = getShareUrl();
      const text = "Check this out!";
      Linking.openURL(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
  };

  const shareToFacebook = () => {
       const url = getShareUrl();
       Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  const copyLink = async () => {
      const url = getShareUrl();
      await Clipboard.setStringAsync(url);
      Alert.alert("Link Copied", "The article link has been copied to your clipboard.");
  };

  const fetchDetails = async () => {
      setIsLoading(true);
      try {
          let data;
          // Determine if we should fetch Video or News
          if (type === 'video') {
             data = await getVideoDetail(id as string);
          } else {
             data = await getNewsDetail(id as string);
          }
          
          setArticle(data);

          // 2. Fetch Related Items
          if (data && data.subcategory_id) {
             let relatedRes;
             if (type === 'video') {
                 relatedRes = await getVideos({ subcategory_id: data.subcategory_id, limit: 6 });
             } else {
                 relatedRes = await getNews({ subcategory_id: data.subcategory_id, limit: 6 });
             }
             setRelatedNews(relatedRes.results || relatedRes || []);
          }

      } catch (error) {
          console.log("Error fetching details:", error);
          // Optional: fallback to other API if 404 and type unknown?
      } finally {
          setIsLoading(false);
      }
  };

  // Helper to extract YouTube ID
  const getYouTubeID = (url: string | undefined) => {
    if (!url) return null;
    // If it looks like an ID (no dots/slashes), assume it is the ID
    if (!url.includes('/') && !url.includes('.')) return url;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Today";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
              <ActivityIndicator size="large" color={theme.text} />
          </View>
      );
  }

  if (!article) {
       return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
              <Text style={{ color: theme.text }}>Article not found</Text>
          </View>
      );
  }

  const videoId = getYouTubeID(article.video || article.video_url); // Handle potential video field

  const handleShare = async () => {
    try {
      const url = getShareUrl();
      await Share.share({
        message: `${article.post_title || article.title}\n\nRead more: ${url}`,
        url: url,
        title: article.post_title || article.title
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
             <TouchableOpacity onPress={handleShare}>
                 <Ionicons name="share-outline" size={24} color={theme.text} />
             </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Title Section */}
        <Text style={[styles.title, { color: theme.text }]}>{article.video_title || article.post_title || article.title}</Text>

        {/* Article Meta Row */}
        <View style={styles.metaRow}>
            <View style={styles.authorSection}>
                <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitials}>{(article.posted_by || article.author || 'D')[0]?.toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={[styles.authorName, { color: theme.text }]}>
                        {((article.posted_by || article.author || 'Jan Himachal') as string).charAt(0).toUpperCase() + ((article.posted_by || article.author || 'Jan Himachal') as string).slice(1)}
                    </Text>
                    <Text style={[styles.date, { color: theme.tabIconDefault }]}>{formatDate(article.video_date || article.post_date || article.date)}</Text>
                </View>
            </View>
            
            {/* Social Icons (Functional) */}
            <View style={styles.socialRow}>
                {/* WhatsApp */}
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#25D366' }]} onPress={shareToWhatsApp}>
                    <FontAwesome name="whatsapp" size={16} color="#fff" />
                </TouchableOpacity>

                {/* Copy Link */}
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#6c757d' }]} onPress={copyLink}>
                    <FontAwesome name="link" size={16} color="#fff" />
                </TouchableOpacity>

                {/* Telegram */}
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#0088cc' }]} onPress={shareToTelegram}>
                    <FontAwesome name="telegram" size={16} color="#fff" />
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#1877F2' }]} onPress={shareToFacebook}>
                    <FontAwesome name="facebook" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>




         {/* Hero Media (YouTube or Image) */}
        {videoId ? (
             <View style={{ height: 250, width: width, marginBottom: 20 }}>
                 <YoutubePlayer
                    height={250}
                    play={true}
                    videoId={videoId}
                 />
             </View>
        ) : article.image ? (
            <Image source={{ uri: article.image }} style={styles.heroImage} />
        ) : null}

        {/* Article Content */}
        <View style={styles.articleBody}>
            {/* Render Short Desc */}
            <Text style={[styles.paragraph, { color: theme.text }]}>
                {article.video_short_des || article.post_short_des || article.description || "No description available."}
            </Text>
             
            {/* Render Post Description (HTML stripped) */}
            {/* Render Post/Video Description (Rich HTML) */}
            {(article.video_des || article.post_des) && (
                <View style={{ marginBottom: 20 }}>
                     <RenderHtml
                        contentWidth={width - 32} // Subtract padding
                        source={{ html: article.video_des || article.post_des || '' }}
                        tagsStyles={{
                            p: { color: theme.text, fontSize: 16, lineHeight: 26, marginBottom: 12, textAlign: 'left' },
                            span: { color: theme.text },
                            a: { color: theme.tint, textDecorationLine: 'underline' },
                            h1: { color: theme.text, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
                            h2: { color: theme.text, fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
                            h3: { color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
                            ul: { color: theme.text, marginBottom: 10 },
                            li: { color: theme.text, fontSize: 16, lineHeight: 26 },
                            div: { color: theme.text }
                        }}
                        systemFonts={['System', 'Roboto', 'Arial']} // Add system fonts
                     />
                </View>
            )}
            
            {/* Ad Placeholder - Nanhe Patrakar */}
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => router.push('/nanhe-patrakar-hub' as any)}
                style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', elevation: 2 }}
            >
                <Image 
                    source={require('@/assets/nanhe-patarkar.jpg')} 
                    style={{ width: '100%', height: 200, resizeMode: 'contain' }} 
                />
            </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

        {/* Related News (Limit 10 + View All) */}
        {/* Related News (Limit 10 + View All) */}
        {/* Related News (Horizontal Explorer) */}
        <View style={styles.relatedSection}>
            <View style={styles.relatedHeaderRow}>
                <Text style={[styles.relatedHeader, { color: theme.text }]}>RELATED NEWS</Text>
            </View>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingBottom: 16 }} // Added bottom padding
            >
                {relatedNews.filter(item => item.id != article.id).map((item) => {
                     // Determine image logic (same as videos page if type is video)
                     let itemImage = item.image || item.thumbnail || '';
                     if (type === 'video' && item.video_url && (!itemImage || itemImage.includes('na.jpg'))) {
                         itemImage = `https://img.youtube.com/vi/${item.video_url}/hqdefault.jpg`;
                     }

                     return (
                         <TouchableOpacity 
                            key={item.id} 
                            activeOpacity={0.9}
                            style={[styles.relatedCard, { backgroundColor: theme.background, borderColor: theme.borderColor }]}
                            onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id, type: type } })} // Pass same type
                         >
                            <Image source={{ uri: itemImage }} style={styles.relatedImage} />
                            <View style={styles.relatedContent}>
                                <View style={styles.relatedCategoryChip}>
                                    <Text style={styles.relatedCategoryText}>{item.category || item.subcategory || (type === 'video' ? 'VIDEO' : 'NEWS')}</Text>
                                </View>
                                <Text numberOfLines={2} style={[styles.relatedTitle, { color: theme.text }]}>
                                    {item.video_title || item.post_title || item.title}
                                </Text>
                                <Text style={styles.relatedDate}>{formatDate(item.video_date || item.post_date || item.date)}</Text>
                            </View>
                         </TouchableOpacity>
                     );
                })}
            </ScrollView>
            
            {/* View All Button */}
            <TouchableOpacity 
                style={[styles.viewAllBtn, { borderColor: theme.tint, marginHorizontal: 16 }]}
                onPress={() => {
                    // If video, maybe go back to Videos tab? Or stay here? 
                    // For now, redirect to appropriate listing
                    if (type === 'video') {
                        router.push('/(tabs)/videos');
                    } else {
                        router.push({ pathname: '/post' as any, params: { type: 'recent', title: 'Related News' } });
                    }
                }} 
            >
                <Text style={[styles.viewAllText, { color: theme.tint }]}>{type === 'video' ? 'View All Videos' : 'View All Related News'}</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.tint} />
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerRight: {
      padding: 4,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    // width: width,
    height: 250,
    marginBottom: 20,
  },
  articleBody: {
    paddingHorizontal: 16,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 20,
    fontWeight: '400',
  },
  adPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  adText: {
    color: '#999',
    fontWeight: '600',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    marginVertical: 20,
    marginHorizontal: 16,
  },
  relatedSection: {
    paddingVertical: 20,
    paddingBottom: 60, // Added extra bottom spacing
    backgroundColor: 'rgba(0,0,0,0.02)', // Subtle background diff
  },
  relatedHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relatedHeader: {
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    paddingLeft: 12,
  },
  relatedCard: {
    width: 260,
    marginRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatedImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#eee',
  },
  relatedContent: {
    padding: 12,
  },
  relatedCategoryChip: {
      alignSelf: 'flex-start',
      backgroundColor: '#FF3B30',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 8,
  },
  relatedCategoryText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
    height: 44, // enforce 2 lines roughly
  },
  relatedDate: {
      color: '#888',
      fontSize: 11,
      fontWeight: '500',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 32, // Increased spacing
    borderRadius: 30, // Pill shape
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 20, // Bottom spacing
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
