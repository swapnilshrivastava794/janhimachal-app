import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
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
    const { id } = useLocalSearchParams();
    
    const [likes, setLikes] = useState(12);
    const [isLiked, setIsLiked] = useState(false);

    // Mock Article for Design
    const article = {
        title: 'मेरे सपनों का हरा-भरा हिमाचल और हमारी जिम्मेदारी',
        category: 'संपादकीय लेख (Article)',
        studentName: 'अनन्या ठाकुर',
        school: 'शिमला पब्लिक स्कूल',
        location: 'शिमला, हिमाचल प्रदेश',
        ageGroup: 'समूह B (11-13 वर्ष)',
        date: '10 जनवरी 2026',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
        content: `हिमाचल की वादियां पूरी दुनिया में अपनी खूबसूरती के लिए जानी जाती हैं। लेकिन क्या हम जानते हैं कि हमारी एक छोटी सी गलती इन पहाड़ों को कितना नुकसान पहुँचा सकती है?

बचपन से ही मैंने देखा है कि सैलानी पहाड़ों पर आते हैं और कचरा फैला देते हैं। मेरी माँ कहती हैं कि ये पहाड़ हमारे पूर्वजों का आशीर्वाद हैं और हमें इन्हें संजोकर रखना चाहिए।

एक नन्हे पत्रकार के तौर पर, मेरा यह फर्ज है कि मैं लोगों को जागरूक करूँ। मैंने अपने स्कूल के दोस्तों के साथ मिलकर एक 'ग्रीन क्लब' बनाया है। हम हर रविवार को अपने आसपास की सफाई करते हैं और लोगों को प्लास्टिक का उपयोग कम करने के लिए प्रेरित करते हैं।

हिमाचल सिर्फ पहाड़ों का नाम नहीं है, यह हमारी संस्कृति और हमारा गौरव है। अगर हम आज नहीं जागे, तो कल बहुत देर हो जाएगी। आइए हम सब मिलकर शपथ लें कि हम अपने हिमाचल को फिर से 'देवभूमि' के पुराने रूप में बनाए रखेंगे।`
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `हिमाचल के नन्हे पत्रकार अनन्या ठाकुर का यह लेख पढ़ें: ${article.title}`,
                url: 'https://janhimachal.com/np/101'
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                
                {/* --- Hero Image Section --- */}
                <View style={styles.heroSection}>
                    <Image source={{ uri: article.image }} style={styles.heroImg} />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.heroOverlay}
                    >
                        <View style={[styles.topBar, { paddingTop: STATUSBAR_HEIGHT + 10 }]}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                                <Ionicons name="chevron-back" size={28} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onShare} style={styles.backBtn}>
                                <Ionicons name="share-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.heroContent}>
                            <View style={styles.catBadge}>
                                <Text style={styles.catText}>{article.category}</Text>
                            </View>
                            <Text style={styles.titleText}>{article.title}</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* --- Author Meta Strip --- */}
                <View style={[styles.authorStrip, { backgroundColor: theme.card, borderBottomColor: theme.borderColor }]}>
                    <View style={styles.authorMain}>
                        <Image source={{ uri: 'https://avatar.iran.liara.run/public/girl?username=Ananya' }} style={styles.authorAvatar} />
                        <View>
                            <View style={styles.authorNameRow}>
                                <Text style={[styles.authorName, { color: theme.text }]}>{article.studentName}</Text>
                                <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
                            </View>
                            <Text style={styles.authorSub}>{article.school} • {article.date}</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.followBtn, { borderColor: theme.primary }]}
                        onPress={() => setIsLiked(!isLiked)}
                    >
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={18} color={isLiked ? theme.danger : theme.primary} />
                        <Text style={[styles.followText, { color: isLiked ? theme.danger : theme.primary }]}>
                            {isLiked ? (likes+1) : likes}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- Article Content --- */}
                <View style={styles.contentBody}>
                    <Text style={[styles.articleText, { color: theme.text }]}>
                        {article.content}
                    </Text>
                </View>

                {/* --- Shabashi Session (Appreciation) --- */}
                <View style={[styles.shabashiRow, { backgroundColor: theme.primary + '10' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.shabashiTitle, { color: theme.primary }]}>शाबाशी दें!</Text>
                        <Text style={[styles.shabashiSub, { color: theme.placeholderText }]}>अनन्या के हौसले को बढ़ाएं</Text>
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
                            <Text style={[styles.aboutValue, { color: theme.text }]}>{article.ageGroup}</Text>
                        </View>
                        <View style={styles.aboutItem}>
                            <Text style={styles.aboutLabel}>स्थान</Text>
                            <Text style={[styles.aboutValue, { color: theme.text }]}>{article.location}</Text>
                        </View>
                    </View>
                    <Text style={[styles.journalistBio, { color: theme.placeholderText }]}>
                        अनन्या शिमला के एक छोटे से गाँव से आती हैं। उन्हें फोटोग्राफी और कविताएं लिखना बहुत पसंद है। वे भविष्य में एक प्रसिद्ध पर्यावरणविद बनना चाहती हैं।
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
        bottom: 0,
        justifyContent: 'space-between',
        padding: 20,
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
    heroContent: {
        marginBottom: 20,
    },
    catBadge: {
        backgroundColor: '#FF9800',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 10,
    },
    catText: { color: '#fff', fontSize: 11, fontWeight: '900' },
    titleText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        lineHeight: 38,
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
