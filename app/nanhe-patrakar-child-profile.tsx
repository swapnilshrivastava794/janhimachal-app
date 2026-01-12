import { getChildProfileDetail, getSubmissions } from '@/api/server';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ChildProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const scrollY = React.useRef(new Animated.Value(0)).current;

    const [profile, setProfile] = useState<any>(null);
    const [stories, setStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchProfileData();
    }, [id]);

    const fetchProfileData = async () => {
        try {
            setIsLoading(true);
            const [profileRes, storiesRes] = await Promise.all([
                getChildProfileDetail(id),
                getSubmissions({ child_id: id, status: 'APPROVED' })
            ]);

            if (profileRes.data && profileRes.data.status) {
                setProfile(profileRes.data.data);
            }
            if (storiesRes.data && storiesRes.data.status) {
                setStories(storiesRes.data.data.results);
            }
        } catch (err) {
            console.error("Error fetching child profile data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 15, color: theme.text, fontSize: 16, fontWeight: '600' }}>नन्हे सितारे की प्रोफ़ाइल...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person-outline" size={64} color={theme.placeholderText} />
                <Text style={{ color: theme.text, fontSize: 18, marginTop: 10 }}>प्रोफ़ाइल नहीं मिल सकी</Text>
                <TouchableOpacity onPress={() => router.back()} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>वापस जाएं</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const childPhoto = profile.photo ? (profile.photo.startsWith('http') ? profile.photo : `${constant.appBaseUrl}${profile.photo}`) : `https://avatar.iran.liara.run/public/boy?username=${profile.name}`;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" translucent />

            {/* --- Stylish Back Button --- */}
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.fixedBackBtn}
                activeOpacity={0.7}
            >
                <View style={styles.blurBtnFallback}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </View>
            </TouchableOpacity>

            <Animated.ScrollView 
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* --- Animated Hero Header --- */}
                <View style={styles.heroContainer}>
                    <Animated.Image 
                        source={{ uri: childPhoto }} 
                        style={[
                            styles.heroBgImg,
                            {
                                transform: [
                                    {
                                        translateY: scrollY.interpolate({
                                            inputRange: [-height, 0, height],
                                            outputRange: [height / 2, 0, -height / 1.5],
                                        }),
                                    },
                                    {
                                        scale: scrollY.interpolate({
                                            inputRange: [-height, 0, height],
                                            outputRange: [2, 1, 1],
                                        }),
                                    },
                                ],
                            },
                        ]} 
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)', theme.background]}
                        locations={[0, 0.4, 0.8, 1]}
                        style={styles.heroGradient}
                    />
                    
                    <View style={styles.profileMasterBox}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: childPhoto }} style={styles.premiumAvatar} />
                            <LinearGradient
                                colors={['#FFD700', '#FFA500']}
                                style={styles.verifyBadge}
                            >
                                <Ionicons name="star" size={12} color="#000" />
                            </LinearGradient>
                        </View>
                        
                        <Text style={styles.premiumName}>{profile.name}</Text>
                        <View style={styles.schoolTag}>
                            <Ionicons name="school-outline" size={14} color="#fff" style={{ opacity: 0.8 }} />
                            <Text style={styles.premiumSchool}>{profile.school_name}</Text>
                        </View>

                        <View style={styles.premiumStatsContainer}>
                            <View style={styles.premiumStatItem}>
                                <Text style={styles.premiumStatVal}>{stories.length}</Text>
                                <Text style={styles.premiumStatLabel}>कहानियां</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.premiumStatItem}>
                                <Text style={styles.premiumStatVal}>{profile.district?.name}</Text>
                                <Text style={styles.premiumStatLabel}>ज़िला</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.premiumStatItem}>
                                <Text style={styles.premiumStatVal}>{profile.age_group}</Text>
                                <Text style={styles.premiumStatLabel}>आयु वर्ग</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* --- Modern Content Section --- */}
                <View style={styles.mainContent}>
                    <View style={[styles.glassCard, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                        <View style={styles.cardHeaderRow}>
                            <View style={[styles.iconBox, { backgroundColor: theme.primary + '20' }]}>
                                <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                            </View>
                            <Text style={[styles.modernSectionTitle, { color: theme.text }]}>नन्हें पत्रकार का परिचय</Text>
                        </View>
                        <Text style={[styles.modernBio, { color: theme.placeholderText }]}>
                            {profile.name} {profile.district?.name} के {profile.school_name} से ताल्लुक रखते हैं। एक नन्हे पत्रकार के तौर पर, वे हिमाचल की छोटी-बड़ी खबरों को आवाज़ देते हैं। {profile.gender === 'F' ? 'उनकी' : 'उनकी'} सक्रियता और रिपोर्टिंग भविष्य के लिए प्रेरणादायक है।
                        </Text>
                    </View>

                    {/* --- Stories Feed --- */}
                    <View style={styles.feedHeader}>
                        <Text style={[styles.feedTitle, { color: theme.text }]}>प्रकाशित खबरें</Text>
                        <View style={[styles.feedCount, { backgroundColor: theme.primary }]}>
                            <Text style={styles.countText}>{stories.length}</Text>
                        </View>
                    </View>

                    {stories.length > 0 ? (
                        stories.map((story, index) => {
                            const storyImg = story.media_files?.[0]?.file ? (story.media_files[0].file.startsWith('http') ? story.media_files[0].file : `${constant.appBaseUrl}${story.media_files[0].file}`) : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400';
                            
                            return (
                                <TouchableOpacity 
                                    key={story.id} 
                                    activeOpacity={0.9}
                                    style={[styles.modernStoryCard, { backgroundColor: theme.card, borderColor: theme.borderColor }]}
                                    onPress={() => router.push({ pathname: '/nanhe-patrakar-reader', params: { id: story.id } } as any)}
                                >
                                    <Image source={{ uri: storyImg }} style={styles.modernStoryImg} />
                                    <View style={styles.modernStoryInfo}>
                                        <View style={styles.topicBadge}>
                                            <Text style={styles.topicText}>{story.topic_title_hindi || story.topic_title}</Text>
                                        </View>
                                        <Text style={[styles.modernStoryTitle, { color: theme.text }]} numberOfLines={2}>
                                            {story.title}
                                        </Text>
                                        <View style={styles.storyMetaRow}>
                                            <Ionicons name="calendar-outline" size={12} color={theme.placeholderText} />
                                            <Text style={[styles.storyMetaText, { color: theme.placeholderText }]}>
                                                {new Date(story.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </Text>
                                            <View style={styles.metaDot} />
                                            <Ionicons name="eye-outline" size={12} color={theme.placeholderText} />
                                            <Text style={[styles.storyMetaText, { color: theme.placeholderText }]}>{story.views || 0}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.arrowBox}>
                                        <Ionicons name="chevron-forward" size={18} color={theme.primary} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.premiumEmptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="newspaper-outline" size={32} color={theme.placeholderText} />
                            </View>
                            <Text style={[styles.emptyText, { color: theme.placeholderText }]}>अभी तक कोई खबर प्रकाशित नहीं हुई है</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    
    // Header & Hero
    fixedBackBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    blurBtnFallback: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 10,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContainer: {
        height: 500,
        width: width,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    heroBgImg: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: 500,
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    profileMasterBox: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    premiumAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 5,
        borderColor: '#fff',
    },
    verifyBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    premiumName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    schoolTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
        gap: 6,
    },
    premiumSchool: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    premiumStatsContainer: {
        flexDirection: 'row',
        marginTop: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    premiumStatItem: { alignItems: 'center', flex: 1 },
    premiumStatVal: { color: '#fff', fontSize: 20, fontWeight: '900' },
    premiumStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase', marginTop: 4, fontWeight: '700' },
    statDivider: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.2)' },

    // Content
    mainContent: { paddingHorizontal: 20, marginTop: -20 },
    glassCard: {
        padding: 24,
        borderRadius: 30,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    modernSectionTitle: { fontSize: 18, fontWeight: '800' },
    modernBio: { fontSize: 15, lineHeight: 24, fontWeight: '500' },

    // Feed
    feedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 40, marginBottom: 20 },
    feedTitle: { fontSize: 22, fontWeight: '900' },
    feedCount: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    countText: { color: '#fff', fontSize: 13, fontWeight: '900' },

    modernStoryCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    modernStoryImg: { width: 90, height: 90, borderRadius: 18 },
    modernStoryInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    topicBadge: { backgroundColor: '#FFD70020', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
    topicText: { color: '#FFA500', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
    modernStoryTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 8 },
    storyMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    storyMetaText: { fontSize: 11, fontWeight: '600' },
    metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
    arrowBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center' },

    // States
    premiumEmptyState: { padding: 50, alignItems: 'center' },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    emptyText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
    retryBtn: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 15 }
});
