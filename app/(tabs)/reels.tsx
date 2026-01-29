import { getVideos } from '@/api/server';
import { NewsSkeleton } from '@/components/NewsSkeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

// VideoCard Component
const VideoCard = React.memo(({ item, isPlaying, onPlay }: { item: any, isPlaying: boolean, onPlay: () => void }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    let videoId = item.video_url;
    if (videoId && videoId.includes('v=')) {
        videoId = videoId.split('v=')[1].split('&')[0];
    } else if (videoId && videoId.includes('youtu.be/')) {
        videoId = videoId.split('youtu.be/')[1].split('?')[0];
    }

    let image = item.thumbnail;
    if (videoId && (!image || image.includes('127.0.0.1') || image.includes('localhost') || image.includes('na.jpg'))) {
        image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    return (
        <View style={[styles.card, { backgroundColor: (theme as any).cardBg || theme.background }]}>

            <Text style={[styles.title, { color: theme.text }]}>
                {item.video_title}
            </Text>

            <View style={styles.playerContainer}>
                {isPlaying ? (
                    <YoutubePlayer
                        height={240}
                        width={width - 24}
                        play={true}
                        videoId={videoId}
                        initialPlayerParams={{
                            modestbranding: true,
                            rel: false,
                        }}
                        webViewProps={{
                            allowsInlineMediaPlayback: true,
                        }}
                    />
                ) : (
                    <TouchableOpacity activeOpacity={0.9} onPress={onPlay} style={[styles.thumbnailContainer, { backgroundColor: '#1a1a1a' }]}>
                        <Image
                            source={{ uri: image }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                        <View style={styles.playOverlay}>
                            <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ height: 10 }} />
        </View>
    );
});

import { useCategory } from '@/context/CategoryContext';
import { useTabBar } from '@/context/TabBarContext';

export default function ReelsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { selectedSubcategoryId } = useCategory(); // Get selected subcategory

    const { hideTabBar, showTabBar } = useTabBar();
    const lastScrollY = useRef(0);

    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Track if we have more data
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

    useEffect(() => {
        fetchReels(1);
    }, []);

    // Refetch when subcategory changes
    useEffect(() => {
        setPage(1);
        setReels([]);
        setHasMore(true); // Reset hasMore
        fetchReels(1, true);
    }, [selectedSubcategoryId]);

    const fetchReels = async (pageNum: number, reset = false) => {
        if (loading && !reset) return;
        if (!hasMore && !reset) return; // Stop if no more data

        setLoading(true);
        try {
            const params: any = {
                video_type: 'reel',
                page: pageNum,
                limit: 10
            };

            // Add subcategory filter if selected
            if (selectedSubcategoryId) {
                params.subcategory_id = selectedSubcategoryId;
            }

            const res = await getVideos(params);
            const newReels = res.results || res || [];

            if (reset) {
                setReels(newReels);
            } else {
                if (newReels.length > 0) {
                    setReels(prev => {
                        // Filter out duplicates based on ID
                        const existingIds = new Set(prev.map(item => item.id));
                        const uniqueNewReels = newReels.filter((item: any) => !existingIds.has(item.id));
                        return [...prev, ...uniqueNewReels];
                    });
                }
            }

            // If we got less results than limit, we reached the end
            if (newReels.length < 10) {
                setHasMore(false);
            } else {
                if (!reset) setPage(pageNum);
            }

        } catch (error: any) {
            // Handle 404 (Invalid Page) gracefully
            if (error.response && error.response.status === 404) {
                setHasMore(false);
            } else {
                console.log("Error fetching reels:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = useCallback((id: string) => {
        setActiveVideoId(id);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={reels}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={({ item }) => (
                    <VideoCard
                        item={item}
                        isPlaying={activeVideoId === item.id}
                        onPlay={() => handlePlay(item.id)}
                    />
                )}
                // Removed auto-play viewability logic

                onEndReached={() => fetchReels(page + 1)}
                onEndReachedThreshold={0.5}

                contentContainerStyle={{ paddingVertical: 10, paddingBottom: 80 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={[styles.center, { height: 300 }]}>
                            <Text style={{ color: theme.text }}>No Videos Found</Text>
                        </View>
                    ) : null
                }
                onScroll={({ nativeEvent }) => {
                    const currentOffset = nativeEvent.contentOffset.y;
                    const direction = currentOffset > 0 && currentOffset > lastScrollY.current ? 'down' : 'up';
                    if (Math.abs(currentOffset - lastScrollY.current) > 10) {
                        if (direction === 'down' && currentOffset > 100) {
                            hideTabBar();
                        } else {
                            showTabBar();
                        }
                        lastScrollY.current = currentOffset;
                    }
                }}
                onMomentumScrollEnd={() => showTabBar()}
            />
            {loading && reels.length === 0 && (
                <View style={{ padding: 12 }}>
                    <NewsSkeleton />
                    <NewsSkeleton />
                    <NewsSkeleton />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        marginHorizontal: 12,
        borderRadius: 16,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 11,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
        lineHeight: 22,
    },
    playerContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 10,
        minHeight: 240, // Height of player
    },
    noVideo: {
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailContainer: {
        width: '100%',
        height: 240,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: 4,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.8,
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '500',
    },
});
