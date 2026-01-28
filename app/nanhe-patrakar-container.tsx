import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NanhePatrakarGuide from './nanhe-patrakar';
import NanhePatrakarHub from './nanhe-patrakar-hub';
import NanhePatrakarPortfolio from './nanhe-patrakar-portfolio';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

// Registration Teaser Screen for Unregistered Users
const NanhePatrakarJoinTeaser = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView contentContainerStyle={styles.teaserContainer} showsVerticalScrollIndicator={false}>
      {/* Cinematic Header Section */}
      <View style={styles.teaserHeader}>
        <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="sparkles" size={14} color={theme.primary} />
          <Text style={[styles.badgeText, { color: theme.primary }]}>LIMITED OPPORTUNITY</Text>
        </View>

        <Text style={[styles.teaserTitle, { color: theme.text }]}>क्या आपका बच्चा बनेगा{"\n"}<Text style={{ color: theme.primary }}>हिमाचल की नई पहचान?</Text></Text>

        <Text style={[styles.teaserDesc, { color: theme.placeholderText }]}>
          "नन्हे पत्रकार" कार्यक्रम से जुड़कर अपने बच्चे की प्रतिभा को निखारें और उन्हें समाज की आवाज़ बनने का मौका दें।
        </Text>

        {/* Registration Button moved up for immediate visibility */}
        <View style={[styles.ctaWrapper, { marginTop: 25, width: '100%' }]}>
          <TouchableOpacity
            style={styles.teaserBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/nanhe-patrakar-registration' as any)}
          >
            <LinearGradient
              colors={['#E31E24', '#B71C1C']}
              style={styles.teaserBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.btnContent}>
                <Text style={styles.teaserBtnText}>अभी रजिस्ट्रेशन करें</Text>
                <Text style={styles.teaserBtnSub}>मात्र ₹369 (एक बार के लिए)</Text>
              </View>
              <View style={styles.btnIconCircle}>
                <Ionicons name="arrow-forward" size={20} color={theme.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.trustNote, { color: theme.placeholderText }]}>
            <Ionicons name="shield-checkmark" size={12} /> 100% सुरक्षित भुगतान
          </Text>
        </View>
      </View>

      {/* Illustration/Art Section */}
      <View style={styles.teaserArtWrapper}>
        <LinearGradient
          colors={[theme.primary, '#8E1418']}
          style={styles.mainArtCircle}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="mic-outline" size={60} color="#fff" />
          <View style={styles.glowEffect} />
        </LinearGradient>
        <View style={[styles.orbitCircle, { borderColor: theme.primary + '40' }]} />
        <View style={[styles.orbitCircle2, { borderColor: theme.primary + '20' }]} />
      </View>

      {/* Premium Benefit Cards */}
      <View style={styles.benefitGrid}>
        {[
          { icon: 'id-card', title: 'प्रेस आईडी कार्ड', desc: 'पहचान और गर्व' },
          { icon: 'document-text', title: 'डिजिटल पोर्टफोलियो', desc: 'लेखन का संग्रह' },
          { icon: 'school', title: 'ट्रेनिंग और गाइडेंस', desc: 'सीखने का अवसर' },
        ].map((b, i) => (
          <View key={i} style={[styles.benefitCard, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
            <View style={[styles.benefitIconBox, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name={b.icon as any} size={22} color={theme.primary} />
            </View>
            <View style={styles.benefitInfo}>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>{b.title}</Text>
              <Text style={[styles.benefitSub, { color: theme.placeholderText }]}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default function NanhePatrakarContainer() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Debug Log
  React.useEffect(() => {
    // console.log('🔍 NanhePatrakarContainer: Current user_type is:', user?.user_type);
  }, [user?.user_type]);

  // Portfolio only shows if the user is explicitly a 'nanhe_patrakar'
  const hasRegisteredChild = !!user && user?.user_type === 'nanhe_patrakar';

  const [activeTab, setActiveTab] = useState<'hub' | 'guide' | 'portfolio' | 'add'>('hub');

  const tabs = [
    { id: 'hub', label: 'सितारे (Stars)', icon: 'planet-outline', activeIcon: 'planet' },
    hasRegisteredChild
      ? { id: 'add', label: 'खबर भेजें', icon: 'add-circle', activeIcon: 'add-circle' }
      : { id: 'guide', label: 'नियम (Guide)', icon: 'book-outline', activeIcon: 'book' },
    {
      id: 'portfolio',
      label: hasRegisteredChild ? 'प्रोफ़ाइल' : 'जोड़ें (Join)',
      icon: hasRegisteredChild ? 'person-outline' : 'add-circle-outline',
      activeIcon: hasRegisteredChild ? 'person' : 'add-circle'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'hub':
        return <NanhePatrakarHub />;
      case 'guide':
        return <NanhePatrakarGuide />;
      case 'portfolio':
        return hasRegisteredChild ? <NanhePatrakarPortfolio /> : <NanhePatrakarJoinTeaser />;
      case 'add':
        // This case should ideally not be reached as we handle 'add' click separately,
        // but kept for safety to show something.
        return <NanhePatrakarPortfolio />;
      default:
        return <NanhePatrakarHub />;
    }
  };

  const handleTabPress = (tabId: string) => {
    if (tabId === 'add') {
      router.push('/nanhe-patrakar-submission' as any);
    } else {
      setActiveTab(tabId as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} />

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Floating Bottom Tab Bar for Nanhe Patrakar Sub-app */}
      <View style={[styles.tabContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <View style={[styles.tabBar, { backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)' }]}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                  <Ionicons
                    name={(isActive ? tab.activeIcon : tab.icon) as any}
                    size={isActive ? 20 : 22}
                    color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'}
                  />
                </View>
                <Text style={[styles.tabLabel, { color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: isActive ? '900' : '600' }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    // Premium Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#E31E24',
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // Teaser Styles
  teaserContainer: { paddingHorizontal: 24, paddingBottom: 150 },
  teaserHeader: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  teaserTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 16, lineHeight: 36 },
  teaserDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, opacity: 0.8 },

  teaserArtWrapper: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  mainArtCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 10,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orbitCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  orbitCircle2: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
  },

  benefitGrid: { gap: 12, marginBottom: 40 },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  benefitIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  benefitInfo: { flex: 1 },
  benefitTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  benefitSub: { fontSize: 12, fontWeight: '500' },

  ctaWrapper: { alignItems: 'center', gap: 15 },
  teaserBtn: { width: '100%', borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  teaserBtnGradient: { paddingVertical: 14, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btnContent: { gap: 2 },
  teaserBtnText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  teaserBtnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  btnIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  trustNote: { fontSize: 11, fontWeight: '600', opacity: 0.6 },
});
