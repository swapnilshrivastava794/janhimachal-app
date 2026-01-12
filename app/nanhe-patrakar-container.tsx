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
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
            <View style={styles.teaserArt}>
                <LinearGradient colors={['#E31E24', '#8E1418']} style={styles.artCircle}>
                    <Ionicons name="star" size={50} color="#fff" />
                </LinearGradient>
                <View style={styles.artDottedCircle} />
            </View>
            
            <Text style={[styles.teaserTitle, { color: theme.text }]}>क्या आपका बच्चा बनेगा हिमाचल की नयी पहचान?</Text>
            <Text style={[styles.teaserDesc, { color: theme.placeholderText }]}>
                "नन्हे पत्रकार" कार्यक्रम से जुड़कर अपने बच्चे की प्रतिभा को पूरी दुनिया को दिखाएं। 
                उससे मिलेगा अपना डिजिटल प्रेस कार्ड और अपनी ख़बरें प्रकाशित करने का मौका।
            </Text>

            <View style={styles.benefitList}>
                {[
                    { icon: 'card-outline', text: 'डिजिटल प्रेस आईडी कार्ड' },
                    { icon: 'newspaper-outline', text: 'खबरों का डिजिटल पोर्टफोलियो' },
                    { icon: 'ribbon-outline', text: 'प्रमाण-पत्र और पहचान' },
                ].map((b, i) => (
                    <View key={i} style={styles.benefitItem}>
                        <Ionicons name={b.icon as any} size={20} color="#E31E24" />
                        <Text style={[styles.benefitText, { color: theme.text }]}>{b.text}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity 
                style={styles.teaserBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/nanhe-patrakar-registration' as any)}
            >
                <LinearGradient colors={['#E31E24', '#B71C1C']} style={styles.teaserBtnGradient}>
                    <Text style={styles.teaserBtnText}>अभी रजिस्ट्रेशन करें (₹599)</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default function NanhePatrakarContainer() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
        <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
  }
  
  // Debug Log
  React.useEffect(() => {
    console.log('🔍 NanhePatrakarContainer: Current user_type is:', user?.user_type);
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
      <View style={styles.tabContainer}>
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
  teaserContainer: { padding: 30, alignItems: 'center', paddingTop: 60, paddingBottom: 150 },
  teaserArt: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  artCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  artDottedCircle: { 
      position: 'absolute', 
      width: 120, 
      height: 120, 
      borderRadius: 60, 
      borderWidth: 2, 
      borderColor: '#E31E24', 
      borderStyle: 'dashed', 
      opacity: 0.3 
  },
  teaserTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 15, lineHeight: 30 },
  teaserDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 30, opacity: 0.8 },
  benefitList: { width: '100%', gap: 15, marginBottom: 40 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: 'rgba(0,0,0,0.03)', padding: 15, borderRadius: 15 },
  benefitText: { fontSize: 14, fontWeight: '700' },
  teaserBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', elevation: 5 },
  teaserBtnGradient: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  teaserBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
