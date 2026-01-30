import { getChildProfilesList, getNanhePatrakarTopics, getSubmissions } from '@/api/server';
import { StoryCardSkeleton } from '@/components/NanhePatrakarSkeleton';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

// Mock Data for the Hub
const FEATURED_STUDENTS = [
    { id: '1', name: 'Rohan', avatar: 'https://avatar.iran.liara.run/public/boy?username=Rohan' },
    { id: '2', name: 'Ananya', avatar: 'https://avatar.iran.liara.run/public/girl?username=Ananya' },
    { id: '3', name: 'Sahil', avatar: 'https://avatar.iran.liara.run/public/boy?username=Sahil' },
    { id: '4', name: 'Mehak', avatar: 'https://avatar.iran.liara.run/public/girl?username=Mehak' },
    { id: '5', name: 'Aryan', avatar: 'https://avatar.iran.liara.run/public/boy?username=Aryan' },
];

const HUB_POSTS = [
    {
        id: '101',
        title: 'मेरे सपनों का हरा-भरा हिमाचल',
        student: 'अनन्या ठाकुर',
        school: 'शिमला पब्लिक स्कूल',
        category: 'लेख (Article)',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=500&auto=format&fit=crop',
        views: '1.2K'
    },
    {
        id: '102',
        title: 'पहाड़ों की पुकार और पर्यावरण',
        student: 'साहिल वर्मा',
        school: 'GSSS धर्मशाला',
        category: 'वीडियो (Video)',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500&auto=format&fit=crop',
        views: '850'
    },
    {
        id: '103',
        title: 'बेटी है अनमोल रतन',
        student: 'महक शर्मा',
        school: 'कॉन्वेंट स्कूल, सोलन',
        category: 'कविता (Poem)',
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8a07a750e?q=80&w=500&auto=format&fit=crop',
        views: '2.1K'
    }
];

export default function NanhePatrakarHubScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user, parentProfile } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All');
    const [childProfiles, setChildProfiles] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    useEffect(() => {
        fetchChildProfiles();
        fetchTopics();
    }, []);

    useEffect(() => {
        setPage(1);
        fetchSubmissions(1, true);
    }, [activeFilter]);

    const fetchTopics = async () => {
        try {
            const res = await getNanhePatrakarTopics();
            if (res.data && res.data.status && res.data.data && res.data.data.results) {
                setTopics(res.data.data.results);
            }
        } catch (err) {
            console.error("Error fetching topics:", err);
        }
    };

    const fetchSubmissions = async (pageNum: number, reset: boolean = false) => {
        try {
            if (reset) setIsLoadingSubmissions(true);
            else setIsMoreLoading(true);

            const selectedTopic = topics.find(t => t.title === activeFilter);
            const params: any = {
                status: 'APPROVED',
                page: pageNum,
                page_size: 10
            };
            if (selectedTopic) {
                params.topic_id = selectedTopic.id;
            }

            const res = await getSubmissions(params);
            if (res.data && res.data.status) {
                const newResults = res.data.data.results;
                setSubmissions(prev => reset ? newResults : [...prev, ...newResults]);
                setHasNextPage(!!res.data.data.next);
                setPage(pageNum);
            }
        } catch (err) {
            console.error("Error fetching submissions:", err);
        } finally {
            setIsLoadingSubmissions(false);
            setIsMoreLoading(false);
        }
    };

    const loadMore = () => {
        if (!isMoreLoading && hasNextPage) {
            fetchSubmissions(page + 1);
        }
    };

    const fetchChildProfiles = async () => {
        try {
            const res = await getChildProfilesList();
            if (res.data && res.data.status && res.data.data && res.data.data.results) {
                setChildProfiles(res.data.data.results);
            }
        } catch (err) {
            console.error("Error fetching child profiles:", err);
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const hasRegisteredChild = !!user && user?.user_type === 'nanhe_patrakar';

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT + 15 }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* --- Premium Hub Header --- */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.hubLabel, { color: theme.primary }]}>Rising Stars of HP</Text>
                        <Text style={[styles.hubTitle, { color: theme.text }]}>नन्हे पत्रकार हब</Text>
                    </View>
                </View>
                {!hasRegisteredChild && (
                    <TouchableOpacity
                        onPress={() => {
                            if (!user) {
                                router.push('/auth/login' as any);
                            } else if (parentProfile) {
                                router.push('/nanhe-patrakar-portfolio' as any);
                            } else {
                                // router.push('/nanhe-patrakar-registration' as any);
                                Linking.openURL(constant.nanhePatrakarPaymentLink);
                            }
                        }}
                        style={[styles.joinHeaderBtn, { backgroundColor: '#E31E24' }]}
                    >
                        <Text style={styles.joinHeaderBtnText}>Join Now</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* --- Join Program Banner --- */}
                {!hasRegisteredChild && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/nanhe-patrakar-guide' as any)}
                        style={styles.joinBanner}
                    >
                        <LinearGradient
                            colors={['#E31E24', '#B71C1C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.joinBannerGradient}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.joinBannerTitle}>अपने बच्चे को बनाएं हिमाचल की आवाज़!</Text>
                                <Text style={styles.joinBannerSub}>नन्हे पत्रकार से जुड़कर अपने बच्चे के आत्मविश्वास और टैलेंट को नई उड़ान दें</Text>
                            </View>
                            <View style={styles.joinBannerIcon}>
                                <Ionicons name="megaphone" size={24} color="#fff" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* --- Story Circles (Featured) --- */}
                <View style={styles.storyStrip}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyScroll}>
                        {childProfiles.length > 0 ? (
                            childProfiles.map((child) => (
                                <TouchableOpacity
                                    key={child.id}
                                    style={styles.storyCircleWrapper}
                                    onPress={() => router.push({ pathname: '/nanhe-patrakar-child-profile', params: { id: child.id } } as any)}
                                >
                                    <LinearGradient
                                        colors={['#E31E24', '#8E1418']}
                                        style={styles.storyRing}
                                    >
                                        {child.photo ? (
                                            <Image
                                                source={{ uri: child.photo.startsWith('http') ? child.photo : `${constant.appBaseUrl}${child.photo}` }}
                                                style={styles.storyAvatar}
                                                onLoad={() => console.log('✅ Image loaded:', child.photo)}
                                                onError={(e) => console.error('❌ Image load error:', e.nativeEvent.error, 'URL:', child.photo)}
                                            />
                                        ) : (
                                            <View style={[styles.storyAvatar, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                                                <Ionicons name="person" size={28} color="#999" />
                                            </View>
                                        )}
                                    </LinearGradient>
                                    <Text style={[styles.storyName, { color: theme.text }]} numberOfLines={1}>
                                        {child.name.split(' ')[0]}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : isLoadingProfiles ? (
                            // Shimmer or generic circles could go here
                            [1, 2, 3, 4, 5].map((i) => (
                                <View key={i} style={styles.storyCircleWrapper}>
                                    <View style={[styles.storyRing, { backgroundColor: theme.borderColor + '40' }]} />
                                    <View style={{ height: 10, width: 40, backgroundColor: theme.borderColor + '40', marginTop: 5, borderRadius: 5 }} />
                                </View>
                            ))
                        ) : (
                            FEATURED_STUDENTS.map((s) => (
                                <TouchableOpacity key={s.id} style={styles.storyCircleWrapper}>
                                    <LinearGradient
                                        colors={['#E31E24', '#8E1418']}
                                        style={styles.storyRing}
                                    >
                                        <Image source={{ uri: s.avatar }} style={styles.storyAvatar} />
                                    </LinearGradient>
                                    <Text style={[styles.storyName, { color: theme.text }]}>{s.name}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* --- Filter Tabs --- */}
                <View style={styles.filterStrip}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {/* Always show "All" */}
                        <TouchableOpacity
                            onPress={() => setActiveFilter('All')}
                            style={[
                                styles.filterTab,
                                { backgroundColor: activeFilter === 'All' ? theme.primary : ((theme as any).card || theme.background) }
                            ]}
                        >
                            <Text style={[styles.filterText, { color: activeFilter === 'All' ? (colorScheme === 'dark' ? '#000' : '#fff') : theme.text }]}>All</Text>
                        </TouchableOpacity>

                        {/* Show dynamic topics */}
                        {topics.map((t) => (
                            <TouchableOpacity
                                key={t.id}
                                onPress={() => setActiveFilter(t.title)}
                                style={[
                                    styles.filterTab,
                                    { backgroundColor: activeFilter === t.title ? theme.primary : ((theme as any).card || theme.background) }
                                ]}
                            >
                                <Text style={[styles.filterText, { color: activeFilter === t.title ? (colorScheme === 'dark' ? '#000' : '#fff') : theme.text }]}>
                                    {t.title_hindi || t.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* --- Posts Grid --- */}
                <View style={styles.gridContainer}>
                    {isLoadingSubmissions ? (
                        <View style={{ paddingHorizontal: 10 }}>
                            <StoryCardSkeleton />
                            <StoryCardSkeleton />
                            <StoryCardSkeleton />
                        </View>
                    ) : submissions.length > 0 ? (
                        submissions.map((post) => {
                            const firstMedia = post.media_files && post.media_files.length > 0 ? post.media_files[0].file : null;
                            const imageUrl = firstMedia
                                ? (firstMedia.startsWith('http') ? firstMedia : `${constant.appBaseUrl}${firstMedia}`)
                                : `${constant.appBaseUrl}/wp-content/uploads/2023/04/jan-himachal-logo.png`;

                            return (
                                <TouchableOpacity
                                    key={post.id}
                                    style={[styles.hubCard, { backgroundColor: (theme as any).card || theme.background }]}
                                    activeOpacity={0.9}
                                    onPress={() => router.push({ pathname: '/nanhe-patrakar-reader', params: { id: post.id } } as any)}
                                >
                                    <Image source={{ uri: imageUrl }} style={styles.cardImg} />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.cardOverlay}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={styles.catBadge}>
                                                <Text style={styles.catText}>{post.topic_title_hindi || post.topic_title}</Text>
                                            </View>
                                            <View style={styles.viewBadge}>
                                                <Ionicons name="eye" size={12} color="#fff" />
                                                <Text style={styles.viewText}>{post.views || '0'}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                                            <View style={styles.authorRow}>
                                                <View style={styles.authorCircle}>
                                                    <Ionicons name="person" size={10} color="#fff" />
                                                </View>
                                                <Text style={styles.authorName}>{post.child_name}</Text>
                                                <View style={styles.dot} />
                                                <Text style={styles.authorSchool} numberOfLines={1}>
                                                    Group {post.child_age_group}
                                                </Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )
                        })
                    ) : (
                        <View style={{ padding: 50, alignItems: 'center' }}>
                            <Ionicons name="newspaper-outline" size={48} color={theme.text} style={{ opacity: 0.2 }} />
                            <Text style={{ marginTop: 10, color: theme.text, opacity: 0.4 }}>इस कैटेगरी में कोई खबर नहीं है</Text>
                        </View>
                    )}
                </View>

                {/* --- Load More --- */}
                {hasNextPage && (
                    <TouchableOpacity
                        style={[styles.loadMoreBtn, { borderColor: theme.borderColor }]}
                        onPress={loadMore}
                        disabled={isMoreLoading}
                    >
                        {isMoreLoading ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <Text style={[styles.loadMoreText, { color: theme.primary }]}>और देखें (Load More)</Text>
                        )}
                    </TouchableOpacity>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* --- Submit FAB (Only for registered kids) --- */}
            {hasRegisteredChild && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/nanhe-patrakar-submission' as any)}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    hubLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
    hubTitle: { fontSize: 24, fontWeight: '900' },
    backButton: {
        padding: 4,
    },
    joinHeaderBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        elevation: 2,
    },
    joinHeaderBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
    joinBanner: {
        marginHorizontal: 20,
        marginBottom: 25,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    joinBannerGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    joinBannerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 4,
    },
    joinBannerSub: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 16,
    },
    joinBannerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBtn: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Story Circles
    storyStrip: { marginBottom: 25 },
    storyScroll: { paddingHorizontal: 15 },
    storyCircleWrapper: { alignItems: 'center', marginHorizontal: 8 },
    storyRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyAvatar: {
        width: 62,
        height: 62,
        borderRadius: 31,
        borderWidth: 2,
        borderColor: '#fff',
    },
    storyName: { fontSize: 11, fontWeight: '700', marginTop: 6 },

    // Filter Tabs
    filterStrip: { marginBottom: 20 },
    filterScroll: { paddingHorizontal: 20, gap: 10 },
    filterTab: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
    },
    filterText: { fontSize: 13, fontWeight: '800' },

    // Grid Container
    gridContainer: { paddingHorizontal: 20, gap: 20 },
    hubCard: {
        height: 280,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    cardImg: { width: '100%', height: '100%' },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        padding: 20,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    catBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    catText: { color: '#fff', fontSize: 10, fontWeight: '800' },
    viewBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    viewText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    cardFooter: { gap: 8 },
    postTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        lineHeight: 28,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    authorCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800' },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.5)' },
    authorSchool: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500', flex: 1 },

    // Load More
    loadMoreBtn: {
        margin: 20,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40
    },
    loadMoreText: { fontWeight: '700', fontSize: 14 },
    fab: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    }
});
