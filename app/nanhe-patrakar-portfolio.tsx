import { getMyChildProfiles, getSubmissions } from '@/api/server';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

export default function NanhePatrakarPortfolioScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [childProfile, setChildProfile] = useState<any>(null);
    const [myStories, setMyStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPortfolioData();
        }
    }, [user]);

    const fetchPortfolioData = async () => {
        try {
            setIsLoading(true);
            const profileRes = await getMyChildProfiles();
            if (profileRes.data && profileRes.data.status && profileRes.data.data.results.length > 0) {
                const profile = profileRes.data.data.results[0];
                setChildProfile(profile);

                const submissionsRes = await getSubmissions({ child_id: profile.id });
                if (submissionsRes.data && submissionsRes.data.status) {
                    setMyStories(submissionsRes.data.data.results);
                }
            }
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: theme.text }}>प्रोफ़ाइल लोड हो रही है...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Portfolio & Identity</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={[styles.authPromptWrapper]}>
                    <View style={[styles.authCard, { backgroundColor: theme.primary + '08', borderColor: theme.borderColor }]}>
                        <View style={[styles.authIconCircle, { backgroundColor: theme.primary }]}>
                            <Ionicons name="lock-closed" size={32} color="#fff" />
                        </View>
                        <Text style={[styles.authTitle, { color: theme.text }]}>पहुंच प्रतिबंधित (Login Required)</Text>
                        <Text style={[styles.authDesc, { color: theme.text }]}>
                            अपना पोर्टफोलियो और प्रमाण पत्र देखने के लिए कृपया लॉगिन करें।
                        </Text>
                        <TouchableOpacity 
                            style={[styles.authLoginBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/auth/login' as any)}
                        >
                            <Text style={styles.authLoginBtnText}>लॉगिन करें</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.back()} style={styles.authCancelBtn}>
                            <Text style={[styles.authCancelText, { color: theme.placeholderText }]}>वापस जाएं</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (!childProfile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={64} color={theme.placeholderText} />
                <Text style={{ color: theme.text, fontSize: 18, marginTop: 15, textAlign: 'center', fontWeight: 'bold' }}>
                    कोई सक्रिय नन्हा पत्रकार प्रोफ़ाइल नहीं मिली
                </Text>
                <Text style={{ color: theme.placeholderText, textAlign: 'center', marginTop: 10 }}>
                    पोर्टफोलियो और प्रमाण पत्र देखने के लिए कृपया पहले रजिस्ट्रेशन प्रक्रिया पूरी करें।
                </Text>
                <TouchableOpacity 
                    onPress={() => router.push('/nanhe-patrakar-registration' as any)}
                    style={[styles.authLoginBtn, { backgroundColor: theme.primary, marginTop: 25, width: '80%' }]}
                >
                    <Text style={styles.authLoginBtnText}>रजिस्ट्रेशन करें</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const childPhoto = childProfile.photo ? (childProfile.photo.startsWith('http') ? childProfile.photo : `${constant.appBaseUrl}${childProfile.photo}`) : `https://avatar.iran.liara.run/public/boy?username=${childProfile.name}`;

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Portfolio & Identity</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons name="share-social-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.profileCard, { backgroundColor: (theme as any).card || theme.background, borderColor: theme.borderColor }]}>
                    <View style={styles.profileTop}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: childPhoto }} style={styles.avatar} />
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={22} color="#FFD700" />
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.nameText, { color: theme.text }]}>{childProfile.name}</Text>
                            <Text style={[styles.schoolText, { color: theme.placeholderText }]}>{childProfile.school_name}, {childProfile.district?.name}</Text>
                            <View style={styles.tagRow}>
                                <View style={[styles.groupTag, { backgroundColor: theme.primary + '15' }]}>
                                    <Text style={[styles.tagText, { color: theme.primary }]}>
                                        {childProfile.age_group_display || `समूह ${childProfile.age_group}`}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {myStories.filter(s => s.status_display === 'Approved').length.toString().padStart(2, '0')}
                            </Text>
                            <Text style={styles.statLabel}>प्रकाशित</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>{Math.floor(Math.random() * 50) + 10}K</Text>
                            <Text style={styles.statLabel}>पाठक</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>{Math.floor(Math.random() * 100) + 20}</Text>
                            <Text style={styles.statLabel}>शाबाशी</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionHeading, { color: theme.text }]}>नन्हा पत्रकार प्रमाण-पत्र</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.certificateWrapper}>
                    <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={styles.certificateContainer}>
                        <View style={styles.certBorder}>
                            <View style={styles.certContent}>
                                <View style={styles.certHeader}>
                                    <Ionicons name="ribbon" size={40} color="#D4AF37" />
                                    <Text style={styles.certOrgName}>JAN HIMACHAL</Text>
                                    <View style={styles.certLine} />
                                    <Text style={styles.certSubHeader}>नन्हा पत्रकार कार्यक्रम</Text>
                                </View>
                                <Text style={styles.certTitle}>प्रमाण-पत्र</Text>
                                <Text style={styles.certBody}>यह प्रमाणित किया जाता है कि</Text>
                                <Text style={styles.certUserName}>{childProfile.name.toUpperCase()}</Text>
                                <Text style={styles.certBodyText}>
                                    ने जन हिमाचल के 'नन्हे पत्रकार' कार्यक्रम में सफलतापूर्वक अपना पंजीकरण कराया है और उन्हें एक सक्रिय बाल पत्रकार के रूप में मान्यता दी जाती है।
                                </Text>
                                <View style={styles.certFooter}>
                                    <View style={styles.signBox}>
                                        <Text style={styles.signText}>संपादक</Text>
                                        <View style={styles.signDetailLine} />
                                        <Text style={styles.signSubText}>जन हिमाचल</Text>
                                    </View>
                                    <View style={styles.certBadge}>
                                        <MaterialCommunityIcons name="seal" size={50} color="#D4AF37" />
                                    </View>
                                    <View style={styles.signBox}>
                                        <Text style={styles.signText}>{new Date(childProfile.created_at).toLocaleDateString()}</Text>
                                        <View style={styles.signDetailLine} />
                                        <Text style={styles.signSubText}>तिथी</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                    <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: theme.primary }]}>
                        <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                        <Text style={styles.downloadBtnText}>प्रमाण-पत्र डाउनलोड करें (PDF)</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                <View style={styles.portfolioHeader}>
                    <Text style={[styles.sectionHeading, { color: theme.text, marginBottom: 0, marginTop: 40 }]}>मेरी रचनाएं (Portfolio)</Text>
                    <TouchableOpacity style={{ marginTop: 40 }}>
                        <Text style={{ color: theme.primary, fontWeight: '700' }}>सब देखें</Text>
                    </TouchableOpacity>
                </View>

                {myStories.length > 0 ? (
                    myStories.map((story) => {
                        const storyImg = story.media_files?.[0]?.file ? (story.media_files[0].file.startsWith('http') ? story.media_files[0].file : `${constant.appBaseUrl}${story.media_files[0].file}`) : 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=300&auto=format&fit=crop';
                        return (
                            <TouchableOpacity 
                                key={story.id} 
                                style={[styles.storyCard, { backgroundColor: (theme as any).card || theme.background, borderColor: theme.borderColor }]}
                                activeOpacity={0.8}
                                onPress={() => router.push({ pathname: '/nanhe-patrakar-reader', params: { id: story.id } } as any)}
                            >
                                <Image source={{ uri: storyImg }} style={styles.storyImage} />
                                <View style={styles.storyContent}>
                                    <View style={styles.storyMeta}>
                                        <Text style={[styles.storyCat, { color: theme.primary }]}>{story.topic_title_hindi || story.topic_title}</Text>
                                        <Text style={styles.storyDate}>{new Date(story.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={[styles.storyTitle, { color: theme.text }]} numberOfLines={2}>
                                        {story.title}
                                    </Text>
                                    <View style={styles.storyFooter}>
                                        <View style={styles.viewsCount}>
                                            <Ionicons name="eye-outline" size={14} color={theme.placeholderText} />
                                            <Text style={styles.viewsText}>{story.views || 0} पाठक</Text>
                                        </View>
                                        <LinearGradient 
                                            colors={
                                                story.status_display === 'Approved' ? ['#4CAF50', '#45a049'] : 
                                                story.status_display === 'Rejected' ? ['#F44336', '#D32F2F'] : 
                                                ['#FF9800', '#F57C00']
                                            } 
                                            style={styles.publishedBadge}
                                        >
                                            <Text style={styles.publishedText}>
                                                {story.status_display === 'Approved' ? 'PUBLISHED' : story.status_display?.toUpperCase() || 'PENDING'}
                                            </Text>
                                        </LinearGradient>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={{ padding: 40, alignItems: 'center', opacity: 0.5 }}>
                        <Ionicons name="document-text-outline" size={48} color={theme.placeholderText} />
                        <Text style={{ marginTop: 10, color: theme.text, fontWeight: '600' }}>अभी तक कोई खबर प्रकाशित नहीं हुई है</Text>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '800' },
    settingsButton: { padding: 4 },
    scrollContent: { padding: 20 },
    profileCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    profileTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 20,
    },
    avatarContainer: { position: 'relative' },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f0f0',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 1,
    },
    profileInfo: { flex: 1 },
    nameText: { fontSize: 22, fontWeight: '900' },
    schoolText: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 2,
        fontWeight: '500',
    },
    tagRow: { flexDirection: 'row', marginTop: 8 },
    groupTag: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: { fontSize: 11, fontWeight: '800' },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '800' },
    statLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '700',
        marginTop: 2,
    },
    statsDivider: {
        width: 1,
        height: '60%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignSelf: 'center',
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 15,
        marginLeft: 4,
    },
    certificateWrapper: { marginBottom: 20 },
    certificateContainer: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    certBorder: {
        borderWidth: 2,
        borderColor: '#D4AF37',
        padding: 5,
        borderRadius: 5,
    },
    certContent: {
        borderWidth: 1,
        borderColor: '#D4AF37',
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 5,
    },
    certHeader: { alignItems: 'center', marginBottom: 20 },
    certOrgName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1A1A1A',
        marginTop: 5,
        letterSpacing: 2,
    },
    certLine: {
        width: 100,
        height: 2,
        backgroundColor: '#D4AF37',
        marginVertical: 5,
    },
    certSubHeader: { fontSize: 10, fontWeight: '700', color: '#444' },
    certTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1A1A1A',
        marginVertical: 15,
        fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    },
    certBody: { fontSize: 12, color: '#555', fontWeight: '600' },
    certUserName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#E31E24',
        marginVertical: 10,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    certBodyText: {
        fontSize: 11,
        color: '#444',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
        fontWeight: '500',
    },
    certFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
        marginTop: 30,
    },
    signBox: { alignItems: 'center', flex: 1 },
    signText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
    },
    signDetailLine: {
        width: '80%',
        height: 1,
        backgroundColor: '#999',
        marginVertical: 5,
    },
    signSubText: { fontSize: 9, fontWeight: '700', color: '#888' },
    certBadge: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 15,
        gap: 10,
        elevation: 5,
    },
    downloadBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    portfolioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 15,
    },
    storyCard: {
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 15,
        height: 120,
    },
    storyImage: { width: 100, height: '100%' },
    storyContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    storyMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    storyCat: { fontSize: 10, fontWeight: '800' },
    storyDate: { fontSize: 10, color: '#888' },
    storyTitle: { fontSize: 14, fontWeight: '800', lineHeight: 20 },
    storyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewsCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewsText: { fontSize: 10, color: '#888', fontWeight: '600' },
    publishedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    publishedText: { color: 'white', fontSize: 8, fontWeight: '900' },
    authPromptWrapper: { flex: 1, justifyContent: 'center', padding: 30 },
    authCard: {
        padding: 30,
        borderRadius: 32,
        borderWidth: 1,
        alignItems: 'center',
        gap: 15,
    },
    authIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    authTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
    authDesc: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.7,
        marginBottom: 10,
    },
    authLoginBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    authLoginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    authCancelBtn: { paddingVertical: 10 },
    authCancelText: { fontSize: 14, fontWeight: '600' },
});
