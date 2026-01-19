import { checkCertificateStatus, createRazorpayOrder, getMyChildProfiles, getSubmissionStats, getSubmissions, verifyRazorpayPayment } from '@/api/server';
import { PortfolioSkeleton } from '@/components/NanhePatrakarSkeleton';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import RazorpayCheckout from '@/utils/razorpay';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

export default function NanhePatrakarPortfolioScreen() {
    const { user, parentProfile, isLoading: authLoading, refreshProfile } = useAuth();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [childProfile, setChildProfile] = useState<any>(null);
    const [myStories, setMyStories] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaid, setIsPaid] = useState(false); // Local state to hide banner after payment
    const [certificateStatus, setCertificateStatus] = useState<{
        ready: boolean;
        message: string;
    }>({ ready: false, message: '' });

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchPortfolioData();
                if (parentProfile?.status === 'PAYMENT_COMPLETED') {
                    setIsPaid(true);
                }
            } else if (!authLoading) {
                setIsLoading(false);
            }
        }, [user, authLoading, parentProfile])
    );

    const generateCertificatePDF = async () => {
        if (!childProfile) return;
        
        try {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {
                            font-family: 'Georgia', serif;
                            padding: 40px;
                            background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
                        }
                        .certificate {
                            border: 3px solid #D4AF37;
                            padding: 40px;
                            text-align: center;
                            background: rgba(255,255,255,0.9);
                        }
                        .header { color: #D4AF37; font-size: 24px; margin-bottom: 10px; }
                        .org-name { font-size: 28px; font-weight: bold; color: #1A1A1A; letter-spacing: 3px; }
                        .sub-header { font-size: 14px; color: #666; margin-top: 5px; }
                        .title { font-size: 36px; font-weight: bold; color: #1A1A1A; margin: 30px 0; }
                        .user-name { font-size: 28px; color: #E31E24; font-weight: bold; text-decoration: underline; margin: 20px 0; }
                        .body-text { font-size: 16px; color: #444; line-height: 1.8; margin: 20px 40px; }
                        .footer { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 40px; }
                        .sign-box { text-align: center; }
                        .sign-line { width: 150px; border-top: 1px solid #999; margin: 10px auto; }
                        .sign-label { font-size: 12px; color: #888; }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <div class="header">🎖️</div>
                        <div class="org-name">JAN HIMACHAL</div>
                        <div class="sub-header">नन्हा पत्रकार कार्यक्रम</div>
                        <div class="title">प्रमाण-पत्र</div>
                        <p>यह प्रमाणित किया जाता है कि</p>
                        <div class="user-name">${childProfile.name?.toUpperCase() || 'STUDENT'}</div>
                        <p class="body-text">
                            ने जन हिमाचल के 'नन्हे पत्रकार' कार्यक्रम में सफलतापूर्वक अपना पंजीकरण कराया है 
                            और उन्हें एक सक्रिय बाल पत्रकार के रूप में मान्यता दी जाती है।
                        </p>
                        <div class="footer">
                            <div class="sign-box">
                                <div class="sign-line"></div>
                                <div class="sign-label">संपादक, जन हिमाचल</div>
                            </div>
                            <div class="sign-box">
                                <div class="sign-line"></div>
                                <div class="sign-label">तिथी: ${new Date().toLocaleDateString('hi-IN')}</div>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
            
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Certificate Download',
                    UTI: 'com.adobe.pdf'
                });
            } else {
                Alert.alert('Success', `PDF saved at: ${uri}`);
            }
        } catch (error) {
            console.error('PDF Error:', error);
            Alert.alert('Error', 'PDF बनाने में समस्या हुई');
        }
    };

    const fetchPortfolioData = async () => {
        try {
            setIsLoading(true);
            const profileRes = await getMyChildProfiles();
            if (profileRes.data && profileRes.data.status && profileRes.data.data.results.length > 0) {
                const profile = profileRes.data.data.results[0];
                setChildProfile(profile);

                // Auto-set isPaid if status from server is already completed
                if (profile.payment_status === 'PAYMENT_COMPLETED' || 
                    profile.status === 'PAYMENT_COMPLETED' ||
                    profile.payment_status === 'SUCCESS' || 
                    profile.is_paid === true ||
                    parentProfile?.status === 'PAYMENT_COMPLETED') {
                    setIsPaid(true);
                }

                // Fetch Stories
                const submissionsRes = await getSubmissions({ child_id: profile.id });
                if (submissionsRes.data && submissionsRes.data.status) {
                    setMyStories(submissionsRes.data.data.results);
                }

                // Fetch Real Stats
                try {
                    const statsRes = await getSubmissionStats();
                    if (statsRes.data && statsRes.data.status) {
                        setStats(statsRes.data.data);
                    }
                } catch (statsErr) {
                    // console.log("Stats API not fully ready yet, using defaults");
                }

                // Check Certificate Status
                try {
                    const certRes = await checkCertificateStatus(profile.id);
                    if (certRes.data) {
                        setCertificateStatus({
                            ready: certRes.data.certificate_ready || false,
                            message: certRes.data.message || ''
                        });
                    }
                } catch (certErr) {
                    // console.log("Certificate check API error:", certErr);
                }
            }
        } catch (error) {
            console.error("Error fetching portfolio data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startPayment = (orderData: any) => {
        const rzpOrderId = orderData?.id || orderData?.razorpay_order_id;
        if (!rzpOrderId) {
            console.error("❌ Order ID missing. Received:", JSON.stringify(orderData));
            Alert.alert("Error", "Invalid Order Data received from server.");
            return;
        }
        const options = {
            description: 'Nanhe Patrakar Registration',
            image: 'https://janhimachal.com/static/img/logo.png',
            currency: 'INR',
            key: constant.razorpayKeyId?.trim(),
            amount: orderData.amount, // amount should be in paise
            name: 'Jan Himachal',
            order_id: rzpOrderId,
            prefill: {
                email: user?.email || 'help@janhimachal.com',
                contact: user?.phone || '',
                name: user?.name || ''
            },
            theme: { color: theme.primary }
        };

        RazorpayCheckout.open(options).then(async (data: any) => {
            // console.log(`Payment Success: ${data.razorpay_payment_id}`);
            try {
                const verifyPayload = {
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature
                };
                
                const verifyRes = await verifyRazorpayPayment(verifyPayload);

                if (verifyRes.data && verifyRes.data.payment_status === "SUCCESS") {
                    Alert.alert('Payment Successful', 'आपका भुगतान सफल रहा!');
                    setIsPaid(true); // Hide banner
                    await refreshProfile(); // Update Context
                    fetchPortfolioData();   // Update UI
                } else {
                    Alert.alert('Processing', 'Payment received. Verifying status...');
                    setIsPaid(true); // Hide banner assuming success
                    await refreshProfile();
                    fetchPortfolioData();
                }
            } catch (verifyErr: any) {
                console.error('Verify Error:', verifyErr);
                Alert.alert('Payment Received', 'आपका भुगतान प्राप्त हो गया है।');
                setIsPaid(true);
                fetchPortfolioData();
            }
        }).catch((error: any) => {
            console.log(`Error: ${error.code} | ${error.description}`);
            Alert.alert('Payment Failed', 'आपका भुगतान विफल रहा। कृपया पुन: प्रयास करें।');
            // Refresh profile to ensure context is updated
            refreshProfile();
            // Stay on portfolio page instead of redirecting to profile
        });
    };


    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // console.log("🚀 Starting Direct Payment from Portfolio...");
            const orderResponse = await createRazorpayOrder();
            if (orderResponse.data && orderResponse.data.status) {
                const orderData = orderResponse.data.data || orderResponse.data;
                startPayment(orderData);
            } else {
                Alert.alert('Error', orderResponse.data?.message || 'Failed to create order');
            }
        } catch (err: any) {
            console.error(err);
            Alert.alert('Error', 'Payment initiation failed. Are you sure you are enrolled?');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />
                
                <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Portfolio & Identity</Text>
                    <View style={{ width: 28 }} />
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <PortfolioSkeleton />
                </ScrollView>
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
                            <Text style={[styles.authLoginBtnText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>लॉगिन करें</Text>
                            <Ionicons name="arrow-forward" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.back()} style={styles.authCancelBtn}>
                            <Text style={[styles.authCancelText, { color: theme.placeholderText }]}>वापस जाएं</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (!isPaid) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

                <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>नन्हा पत्रकार प्रोफ़ाइल</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                    {/* Marketing Preview for Unpaid Users - Centered */}
                    <View style={{  marginBottom: 40,  backgroundColor: '#FFFDF5', borderRadius: 16, borderWidth: 1, borderColor: '#FFEEBA', overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
                        {/* Urgency Badge */}
                        <View style={{ backgroundColor: '#FF8C00', paddingVertical: 6, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
                                🔥 सीमित अवसर: अगले 50 सफल रजिस्ट्रेशन के लिए 'Star Reporter' बैच!
                            </Text>
                        </View>

                        <View style={{ padding: 18 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <View style={{ backgroundColor: '#FFF3CD', padding: 8, borderRadius: 10 }}>
                                    <Ionicons name="alert-circle" size={24} color="#856404" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#1A1A1A', fontWeight: '900', fontSize: 17 }}>आपका भुगतान पेंडिंग है</Text>
                                    <Text style={{ fontSize: 12, color: '#856404', marginTop: 2 }}>पंजीकरण पूरा करने के लिए भुगतान अनिवार्य है</Text>
                                </View>
                            </View>

                            <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20, fontSize: 13, lineHeight: 18 }}>
                                अपने पोर्टफोलियो और प्रमाण पत्र को अनलॉक करने के लिए रजिस्ट्रेशन प्रक्रिया पूरी करें।
                            </Text>

                            {/* Preview Section - Locked ID & Certificate */}
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#1A1A1A', marginBottom: 10, textTransform: 'uppercase' }}>अनलॉक होने के लिए तैयार:</Text>
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                                <View style={{ flex: 1, height: 100, backgroundColor: '#f8f9fa', borderRadius: 12, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden', position: 'relative' }}>
                                    <View style={{ padding: 8, opacity: 0.1 }}>
                                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#ccc' }} />
                                        <View style={{ height: 6, backgroundColor: '#ccc', marginTop: 10, width: '80%', borderRadius: 3 }} />
                                        <View style={{ height: 15, backgroundColor: '#E31E24', marginTop: 10, borderRadius: 4, width: '100%' }} />
                                    </View>
                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name="lock-closed" size={24} color="#856404" />
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#856404', marginTop: 4 }}>प्रेस आईडी कार्ड</Text>
                                    </View>
                                </View>

                                <View style={{ flex: 1, height: 100, backgroundColor: '#fdfcfb', borderRadius: 12, borderWidth: 1, borderColor: '#D4AF37', borderStyle: 'dotted', overflow: 'hidden', position: 'relative' }}>
                                    <View style={{ padding: 10, alignItems: 'center', opacity: 0.1 }}>
                                        <Ionicons name="ribbon" size={20} color="#D4AF37" />
                                        <View style={{ height: 5, backgroundColor: '#D4AF37', marginTop: 8, width: '70%', borderRadius: 2 }} />
                                    </View>
                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name="lock-closed" size={24} color="#D4AF37" />
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#D4AF37', marginTop: 4 }}>प्रमाण-पत्र</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity 
                                onPress={handlePayment}
                                style={{ backgroundColor: '#856404', paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 4 }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>भुगतान करें और अनलॉक करें</Text>
                            </TouchableOpacity>

                            <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: '#FFEEBA', paddingTop: 12, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                <Ionicons name="shield-checkmark" size={14} color="#28a745" />
                                <Text style={{ fontSize: 10, color: '#666', flex: 1 }}>
                                    यह शुल्क आपके आईडी कार्ड, सर्टिफिकेट और क्लाउड सर्वर सेवाओं के लिए है।
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    // Safety check: If paid but no childProfile loaded yet, it might mean they haven't created one.
    // Logic: isPaid (from parentProfile) is TRUE, but childProfile (from getMyChildProfiles) is NULL.
    // We should prompt them to creating a profile.
    // Safety check: If paid but no childProfile loaded yet, show loading
    if (!childProfile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: theme.text }}>प्रोफ़ाइल डेटा लोड हो रहा है...</Text>
                <TouchableOpacity 
                    onPress={() => fetchPortfolioData()}
                    style={{ marginTop: 20, padding: 12, backgroundColor: theme.primary + '15', borderRadius: 10 }}
                >
                    <Text style={{ color: theme.primary, fontWeight: '700' }}>पुनः प्रयास करें</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Standard loading check
    if (!childProfile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: theme.text }}>प्रोफ़ाइल डेटा लोड हो रहा है...</Text>
                <TouchableOpacity 
                    onPress={() => fetchPortfolioData()}
                    style={{ marginTop: 20, padding: 12, backgroundColor: theme.primary + '15', borderRadius: 10 }}
                >
                    <Text style={{ color: theme.primary, fontWeight: '700' }}>पुनः प्रयास करें</Text>
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
                <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={async () => {
                        try {
                            await Share.share({
                                message: `${childProfile?.name || 'मेरा बच्चा'} जन हिमाचल के "नन्हे पत्रकार" कार्यक्रम का सदस्य है! 🎉\n\nJan Himachal - Voice of Himachal`,
                                title: 'नन्हा पत्रकार Portfolio'
                            });
                        } catch (error) {
                            console.log('Share error:', error);
                        }
                    }}
                >
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
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Text style={[styles.nameText, { color: theme.text, flex: 1 }]}>{childProfile.name}</Text>
                                <TouchableOpacity 
                                    onPress={() => router.push({
                                        pathname: '/nanhe-patrakar-edit-child',
                                        params: { profileData: JSON.stringify(childProfile) }
                                    } as any)}
                                    style={[styles.editBtn, { backgroundColor: theme.primary + '15' }]}
                                >
                                    <Ionicons name="pencil-outline" size={16} color={theme.primary} />
                                    <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Edit</Text>
                                </TouchableOpacity>
                            </View>
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
                                {stats?.total_approved?.toString().padStart(2, '0') || '00'}
                            </Text>
                            <Text style={styles.statLabel}>प्रकाशित</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {stats?.total_views >= 1000 ? `${(stats.total_views / 1000).toFixed(1)}K` : stats?.total_views || '0'}
                            </Text>
                            <Text style={styles.statLabel}>पाठक</Text>
                        </View>
                        <View style={styles.statsDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {stats?.total_likes || '0'}
                            </Text>
                            <Text style={styles.statLabel}>शाबाशी</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionHeading, { color: theme.text }]}>नन्हा पत्रकार प्रमाण-पत्र</Text>
                
                {/* Certificate Not Ready Message */}
                {!certificateStatus.ready && (
                    <View style={[styles.certificateLockedCard, { backgroundColor: theme.primary + '08', borderColor: theme.borderColor }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={[styles.lockedIconCircle, { backgroundColor: theme.primary + '15' }]}>
                                <Ionicons name="lock-closed" size={24} color={theme.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.lockedTitle, { color: theme.text }]}>प्रमाण-पत्र अभी तैयार नहीं है</Text>
                                <Text style={[styles.lockedDesc, { color: theme.placeholderText }]}>
                                    अपनी पहली खबर भेजें और उसे Approve होने दें। उसके बाद आपका प्रमाण-पत्र उपलब्ध हो जाएगा।
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            onPress={() => router.push('/nanhe-patrakar-submission' as any)}
                            style={[styles.submitNowBtn, { backgroundColor: theme.primary }]}
                        >
                            <Ionicons name="create-outline" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                            <Text style={[styles.submitNowBtnText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>अभी खबर भेजें</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Certificate - Show only if ready */}
                {certificateStatus.ready && (
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
                    <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: theme.primary }]}
                    onPress={generateCertificatePDF}
                    >
                        <Ionicons name="cloud-download-outline" size={20} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                        <Text style={[styles.downloadBtnText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>प्रमाण-पत्र डाउनलोड करें (PDF)</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
                )}

                <View style={styles.portfolioHeader}>
                    <Text style={[styles.sectionHeading, { color: theme.text, marginBottom: 0, marginTop: 40 }]}>मेरी रचनाएं (Portfolio)</Text>
                    <TouchableOpacity 
                        style={{ marginTop: 40 }}
                        onPress={() => router.push('/nanhe-patrakar-hub' as any)}
                    >
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
                <View style={{ height: insets.bottom + 100 }} />
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
    certificateLockedCard: {
        padding: 16,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 20,
    },
    lockedIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
    },
    lockedDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    submitNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    submitNowBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
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
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
});
