import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SectionList, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, FlatList } from 'react-native';
import { getNews, getVideos } from '@/api/server';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh every 10 minutes
    const interval = setInterval(() => {
        fetchData();
    }, 10 * 60 * 1000); // 10 mins

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
      // setLoading(true); // Don't block UI on refresh
      try {
          const [news, videos] = await Promise.all([
             getNews({ limit: 10, latest: '1' }),
             getVideos({ limit: 10, latest: '1' })
          ]);

          const newsItems = (news.results || news || []).map((item: any) => ({
             id: `news-${item.id}`,
             nativeId: item.id,
             type: 'news',
             title: item.post_title || item.title,
             message: item.post_short_des || "Latest News Update",
             time: new Date(item.post_date || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             dateOb: new Date(item.post_date || item.date),
             navType: 'news'
          }));

          const videoItems = (videos.results || videos || []).map((item: any) => ({
             id: `video-${item.id}`,
             nativeId: item.id,
             type: 'video',
             title: item.video_title || item.title,
             message: "New Video Added",
             time: new Date(item.video_date || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             dateOb: new Date(item.video_date || item.date),
             navType: 'video'
          }));

          const all = [...newsItems, ...videoItems].sort((a, b) => b.dateOb.getTime() - a.dateOb.getTime());
          setNotifications(all);

      } catch (error) {
          console.log("Error fetching notifications:", error);
      } finally {
          setLoading(false);
          setRefreshing(false);
      }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const getIcon = (type: string) => {
    if (type === 'video') return <Ionicons name="play-circle" size={24} color="#FF3B30" />;
    return <Ionicons name="newspaper" size={24} color={theme.tint} />;
  };

  const handlePress = (item: any) => {
      // Navigate to detail
      router.push({ pathname: '/post/[id]', params: { id: item.nativeId, type: item.navType } });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
        style={[styles.itemContainer, { backgroundColor: theme.background, borderColor: theme.borderColor }]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
    >
        <View style={[styles.iconContainer, { backgroundColor: item.navType === 'video' ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.1)' }]}>
            {getIcon(item.navType)}
        </View>
        <View style={styles.contentContainer}>
             <View style={styles.topRow}>
                 <Text style={[styles.itemType, { color: item.navType === 'video' ? '#FF3B30' : theme.tint }]}>
                     {item.navType === 'video' ? 'VIDEO UPDATE' : 'LATEST NEWS'}
                 </Text>
                 <Text style={styles.timeText}>{item.time}</Text>
             </View>
            <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
            {item.message && item.message !== item.title && (
                <Text style={[styles.itemMessage, { color: '#888' }]} numberOfLines={1}>{item.message}</Text>
            )}
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor, backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
      </View>

      {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.text} />
          </View>
      ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#888' }}>No updates available</Text>
                </View>
            }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16, // More rounded
    borderWidth: 1,
    alignItems: 'center', // Center vertically
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});
