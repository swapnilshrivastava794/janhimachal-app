import { getSubmissionDetail } from '@/api/server';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Audio as ExpoAudio, ResizeMode, Video } from 'expo-av';
import Constants from 'expo-constants';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

export default function NanhePatrakarReaderScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { id } = useLocalSearchParams<{ id: string }>();
    
    const [likes, setLikes] = useState(12);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [articleData, setArticleData] = useState<any>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const fetchDetail = async () => {
        try {
            setIsLoading(true);
            const res = await getSubmissionDetail(id);
            if (res.data && res.data.status) {
                setArticleData(res.data.data);
                // Set audio mode for video playback
                await ExpoAudio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    staysActiveInBackground: false,
                    playThroughEarpieceAndroid: false,
                });
            }
        } catch (err) {
            console.error("Error fetching submission detail:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const MediaItem = ({ item, index }: { item: any, index: number }) => {
        const videoRef = React.useRef<Video>(null);
        const [isBuffering, setIsBuffering] = useState(false);
        const [isLoaded, setIsLoaded] = useState(false);
        const [status, setStatus] = useState<any>({});
        const mediaUrl = item.file.startsWith('http') ? item.file : `${constant.appBaseUrl}${item.file}`;

        const handlePlayPress = () => {
            if (videoRef.current) {
                videoRef.current.playAsync();
            }
        };
        
        if (item.media_type === 'VIDEO') {
            return (
                <View style={{ width, height: 480, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                    <Video
                        ref={videoRef}
                        source={{ uri: mediaUrl }}
                        style={styles.heroImg}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        shouldPlay={false}
                        onLoad={() => setIsLoaded(true)}
                        onPlaybackStatusUpdate={status => {
                            setStatus(status);
                            setIsBuffering((status as any).isBuffering);
                        }}
                    />
                    
                    {/* Big Center Play Button - Active when not playing */}
                    {!status.isPlaying && (
                        <TouchableOpacity 
                            style={styles.playOverlay}
                            onPress={handlePlayPress}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.playCircle, { opacity: isLoaded ? 1 : 0.5 }]}>
                                {isBuffering || !isLoaded ? (
                                    <ActivityIndicator size="large" color="#fff" />
                                ) : (
                                    <Ionicons name="play" size={40} color="#fff" style={{ marginLeft: 5 }} />
                                )}
                            </View>
                            {isLoaded && !isBuffering && <Text style={styles.playHint}>देखने के लिए क्लिक करें</Text>}
                            {(!isLoaded || isBuffering) && <Text style={styles.playHint}>लोड हो रहा है...</Text>}
                        </TouchableOpacity>
                    )}

                    {/* Minimal buffering indicator when playing */}
                    {status.isPlaying && isBuffering && (
                        <View style={styles.miniLoader}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    )}
                </View>
            );
        }

        return (
            <View style={{ width, height: 480, backgroundColor: theme.primary + '10', overflow: 'hidden' }}>
                <ExpoImage 
                    source={{ uri: mediaUrl }} 
                    style={[styles.heroImg, { width }]} 
                    contentFit="cover"
                    transition={1000}
                    onLoad={() => setIsLoaded(true)}
                    // Removed the low-res placeholder that was causing the 'small image' look
                />
                {!isLoaded && (
                    <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.primary + '10' }]}>
                        <ActivityIndicator size="small" color={theme.primary} />
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: theme.text }}>खबर खुल रही है...</Text>
            </View>
        );
    }

    if (!articleData) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>विवरण नहीं मिल सका</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary }}>वापस जाएं</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const firstMedia = articleData.media_files && articleData.media_files.length > 0 ? articleData.media_files[0].file : null;
    const heroImage = firstMedia ? (firstMedia.startsWith('http') ? firstMedia : `${constant.appBaseUrl}${firstMedia}`) : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop';
    const childPhoto = articleData.child_details?.photo ? (articleData.child_details.photo.startsWith('http') ? articleData.child_details.photo : `${constant.appBaseUrl}${articleData.child_details.photo}`) : `https://avatar.iran.liara.run/public/boy?username=${articleData.child_details?.name}`;

    const onShare = async () => {
        try {
            await Share.share({
                message: `हिमाचल के नन्हे पत्रकार ${articleData.child_details?.name} का यह लेख पढ़ें: ${articleData.title}`,
                url: articleData.published_url || `${constant.appBaseUrl}/np/${articleData.id}`
            });
        } catch (error) {
            // console.log(error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                
                {/* --- Media Slider Section --- */}
                <View style={styles.heroSection}>
                    <FlatList
                        data={articleData.media_files && articleData.media_files.length > 0 ? articleData.media_files : [{ media_type: 'IMAGE', file: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop' }]}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const offset = e.nativeEvent.contentOffset.x;
                            setActiveIndex(Math.round(offset / width));
                        }}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => <MediaItem item={item} index={index} />}
                    />

                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent']}
                        style={styles.heroOverlay}
                        pointerEvents="box-none"
                    >
                        <View style={[styles.topBar, { paddingTop: STATUSBAR_HEIGHT + 10 }]}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                                <Ionicons name="chevron-back" size={28} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onShare} style={styles.backBtn}>
                                <Ionicons name="share-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    {/* Pagination Dots */}
                    {articleData.media_files?.length > 1 && (
                        <View style={styles.dotsOverlay}>
                            {articleData.media_files.map((_: any, i: number) => (
                                <View 
                                    key={i} 
                                    style={[
                                        styles.dot, 
                                        { backgroundColor: activeIndex === i ? theme.primary : 'rgba(255,255,255,0.5)', width: activeIndex === i ? 20 : 6 }
                                    ]} 
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* --- Content Title Section --- */}
                <View style={[styles.titleSection, { backgroundColor: theme.background }]}>
                    <View style={styles.catBadge}>
                        <Text style={styles.catText}>{articleData.topic_details?.title_hindi || articleData.topic_details?.title}</Text>
                    </View>
                    <Text style={[styles.titleText, { color: theme.text }]}>{articleData.title}</Text>
                </View>

                {/* --- Author Meta Strip --- */}
                <View style={[styles.authorStrip, { backgroundColor: theme.card, borderBottomColor: theme.borderColor }]}>
                    <View style={styles.authorMain}>
                        <ExpoImage source={{ uri: childPhoto }} style={styles.authorAvatar} />
                        <View>
                            <View style={styles.authorNameRow}>
                                <Text style={[styles.authorName, { color: theme.text }]}>{articleData.child_details?.name}</Text>
                                <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
                            </View>
                            <Text style={styles.authorSub}>{articleData.child_details?.school} • {new Date(articleData.created_at).toLocaleDateString()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.followBtn, { borderColor: theme.primary }]}
                        onPress={() => setIsLiked(!isLiked)}
                    >
                        <Ionicons name={(isLiked ? "heart" : "heart-outline") as any} size={18} color={isLiked ? theme.error : theme.primary} />
                        <Text style={[styles.followText, { color: isLiked ? theme.error : theme.primary }]}>
                            {isLiked ? (likes+1) : likes}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- Article Content --- */}
                <View style={styles.contentBody}>
                    <Text style={[styles.articleText, { color: theme.text }]}>
                        {articleData.content_text}
                    </Text>
                </View>

                {/* --- Shabashi Session (Appreciation) --- */}
                <View style={[styles.shabashiRow, { backgroundColor: theme.primary + '10' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.shabashiTitle, { color: theme.primary }]}>शाबाशी दें!</Text>
                        <Text style={[styles.shabashiSub, { color: theme.placeholderText }]}>{articleData.child_details?.name?.split(' ')[0]} के हौसले को बढ़ाएं</Text>
                    </View>
                    <TouchableOpacity 
                        style={[styles.shabashiBtn, { backgroundColor: theme.primary }]}
                        activeOpacity={0.8}
                        onPress={() => {
                            setIsLiked(true);
                        }}
                    >
                        <Ionicons name="sunny" size={24} color="#fff" />
                        <Text style={styles.shabashiBtnText}>शाबाशी (Applaud)</Text>
                    </TouchableOpacity>
                </View>

                {/* --- About the Journalist --- */}
                <View style={[styles.aboutJournalist, { backgroundColor: theme.card }]}>
                    <Text style={[styles.aboutTitle, { color: theme.text }]}>नन्हें पत्रकार के बारे में</Text>
                    <View style={styles.aboutRow}>
                        <View style={styles.aboutItem}>
                            <Text style={styles.aboutLabel}>आयु वर्ग</Text>
                            <Text style={[styles.aboutValue, { color: theme.text }]}>Group {articleData.child_details?.age_group} ({articleData.child_details?.age} वर्ष)</Text>
                        </View>
                        <View style={styles.aboutItem}>
                            <Text style={styles.aboutLabel}>स्थान</Text>
                            <Text style={[styles.aboutValue, { color: theme.text }]}>{articleData.child_details?.district}</Text>
                        </View>
                    </View>
                    <Text style={[styles.journalistBio, { color: theme.placeholderText }]}>
                        {articleData.child_details?.name} {articleData.child_details?.district} के {articleData.child_details?.school} के छात्र हैं। वे एक नन्हे पत्रकार के रूप में समाज में सकारात्मक बदलाव लाना चाहते हैं।
                    </Text>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { paddingBottom: 40 },
    
    // Hero Section
    heroSection: {
        height: 480,
        position: 'relative',
    },
    heroImg: { width: '100%', height: '100%' },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
        padding: 20,
    },
    dotsOverlay: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    catBadge: {
        backgroundColor: '#FF9800',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 12,
    },
    catText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    titleText: {
        fontSize: 24,
        fontWeight: '900',
        lineHeight: 34,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    playCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    playHint: {
        color: '#fff',
        marginTop: 15,
        fontWeight: '700',
        fontSize: 14,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    loaderText: {
        color: '#fff',
        marginTop: 10,
        fontWeight: '700',
    },
    miniLoader: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 20,
    },

    // Author Strip
    authorStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    authorMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    authorAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#eee',
    },
    authorNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    authorName: { fontSize: 15, fontWeight: '800' },
    authorSub: { fontSize: 11, color: '#888', fontWeight: '500', marginTop: 1 },
    followBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1.5,
    },
    followText: { fontSize: 12, fontWeight: '800' },

    // Content Body
    contentBody: {
        padding: 24,
    },
    articleText: {
        fontSize: 18,
        lineHeight: 32,
        fontWeight: '400',
    },

    // Shabashi
    shabashiRow: {
        margin: 20,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    shabashiTitle: { fontSize: 18, fontWeight: '900' },
    shabashiSub: { fontSize: 12, fontWeight: '600' },
    shabashiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 15,
        elevation: 4,
    },
    shabashiBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },

    // About
    aboutJournalist: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 24,
    },
    aboutTitle: { fontSize: 16, fontWeight: '800', marginBottom: 20 },
    aboutRow: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 15,
    },
    aboutItem: {
        gap: 4,
    },
    aboutLabel: { fontSize: 10, color: '#888', fontWeight: '700', textTransform: 'uppercase' },
    aboutValue: { fontSize: 13, fontWeight: '800' },
    journalistBio: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '500',
        marginTop: 10,
    }
});
