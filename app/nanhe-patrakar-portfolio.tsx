import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

// Mock Data for Design Demonstration
const PUBLISHED_STORIES = [
    {
        id: '1',
        title: 'हिमाचल की प्राकृतिक सुंदरता और संरक्षण',
        date: '10 Jan 2026',
        views: '1.2K',
        category: 'लेख (Article)',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=500&auto=format&fit=crop'
    },
    {
        id: '2',
        title: 'पहाड़ों की पुकार (मेरी पहली कविता)',
        date: '05 Jan 2026',
        views: '850',
        category: 'कविता (Poem)',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500&auto=format&fit=crop'
    }
];

export default function NanhePatrakarPortfolioScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* --- Custom Compact Header --- */}
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
                
                {/* --- Profile Branding Card --- */}
                <View style={[styles.profileCard, { backgroundColor: (theme as any).card || theme.background, borderColor: theme.borderColor }]}>
                    <View style={styles.profileTop}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={{ uri: 'https://avatar.iran.liara.run/public/boy?username=Rohan' }} 
                                style={styles.avatar} 
                            />
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={22} color="#FFD700" />
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.nameText, { color: theme.text }]}>रोहन ठाकुर</Text>
                            <Text style={[styles.schoolText, { color: theme.placeholderText }]}>राजकीय वरिष्ठ माध्यमिक पाठशाला, शिमला</Text>
                            <View style={styles.tagRow}>
                                <View style={[styles.groupTag, { backgroundColor: theme.primary + '15' }]}>
                                    <Text style={[styles.tagText, { color: theme.primary }]}>समूह B (11-13 वर्ष)</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>05</Text>
                            <Text style={styles.statLabel}>प्रकाशित</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>2.4K</Text>
                            <Text style={styles.statLabel}>पाठक</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                            <Text style={styles.statLabel}>शाबाशी</Text>
                        </View>
                    </View>
                </View>

                {/* --- Digital ID Card Preview --- */}
                <Text style={[styles.sectionHeading, { color: theme.text }]}>डिजिटल प्रेस कार्ड (E-Card)</Text>
                <TouchableOpacity activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#1e3c72', '#2a5298']}
                        style={styles.idCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.idHeader}>
                            <Ionicons name="newspaper" size={20} color="#fff" />
                            <Text style={styles.idHeaderText}>JAN HIMACHAL - NANHE PATRAKAR</Text>
                        </View>
                        <View style={styles.idBody}>
                            <View style={styles.idAvatar} />
                            <View style={styles.idDetails}>
                                <Text style={styles.idName}>ROHAN THAKUR</Text>
                                <Text style={styles.idRole}>ID: JH-NP-2026-0042</Text>
                                <Text style={styles.idRole}>ROLE: JUNIOR REPORTER</Text>
                            </View>
                            <View style={styles.qrPlaceholder}>
                                <Ionicons name="qr-code-outline" size={40} color="white" />
                            </View>
                        </View>
                        <View style={styles.idFooter}>
                            <Text style={styles.idExpiry}>VALID UNTIL: DEC 2026</Text>
                            <Text style={styles.idAction}>DOWNLOAD PDF →</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* --- My Portfolio Stories --- */}
                <View style={styles.portfolioHeader}>
                    <Text style={[styles.sectionHeading, { color: theme.text, marginBottom: 0 }]}>मेरी रचनाएं (Portfolio)</Text>
                    <TouchableOpacity>
                        <Text style={{ color: theme.primary, fontWeight: '700' }}>सब देखें</Text>
                    </TouchableOpacity>
                </View>

                {PUBLISHED_STORIES.map((story) => (
                    <TouchableOpacity 
                        key={story.id} 
                        style={[styles.storyCard, { backgroundColor: (theme as any).card || theme.background, borderColor: theme.borderColor }]}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: story.image }} style={styles.storyImage} />
                        <View style={styles.storyContent}>
                            <View style={styles.storyMeta}>
                                <Text style={[styles.storyCat, { color: theme.primary }]}>{story.category}</Text>
                                <Text style={styles.storyDate}>{story.date}</Text>
                            </View>
                            <Text style={[styles.storyTitle, { color: theme.text }]} numberOfLines={2}>
                                {story.title}
                            </Text>
                            <View style={styles.storyFooter}>
                                <View style={styles.viewsCount}>
                                    <Ionicons name="eye-outline" size={14} color={theme.placeholderText} />
                                    <Text style={styles.viewsText}>{story.views} Readers</Text>
                                </View>
                                <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.publishedBadge}>
                                    <Text style={styles.publishedText}>PUBLISHED</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 40 }} />
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
    
    // Profile Card Style
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
    avatarContainer: {
        position: 'relative',
    },
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
    profileInfo: {
        flex: 1,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '900',
    },
    schoolText: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 2,
        fontWeight: '500',
    },
    tagRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    groupTag: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '800',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
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

    // ID Card Styles
    sectionHeading: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 15,
        marginLeft: 4,
    },
    idCard: {
        height: 200,
        borderRadius: 20,
        padding: 20,
        marginBottom: 35,
        justifyContent: 'space-between',
        shadowColor: '#1e3c72',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    idHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    idHeaderText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        opacity: 0.9,
    },
    idBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    idAvatar: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    idDetails: {
        flex: 1,
    },
    idName: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    idRole: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
    qrPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    idFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 10,
    },
    idExpiry: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 9,
        fontWeight: '600',
    },
    idAction: {
        color: 'white',
        fontSize: 11,
        fontWeight: '800',
    },

    // Portfolio Content Styles
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
    storyImage: {
        width: 100,
        height: '100%',
    },
    storyContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    storyMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    storyCat: {
        fontSize: 10,
        fontWeight: '800',
    },
    storyDate: {
        fontSize: 10,
        color: '#888',
    },
    storyTitle: {
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 20,
    },
    storyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewsCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewsText: {
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
    },
    publishedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    publishedText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '900',
    },
});
