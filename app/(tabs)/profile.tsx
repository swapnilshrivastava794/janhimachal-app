import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import LoginScreen from '../auth/login';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { user, isLoading, logout, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // For Demo: Assume child is registered
  const hasRegisteredChild = true; 

  useEffect(() => {
    if (user) {
        setName(user.name || '');
        setPhone(user.phone || '');
        setCity(user.city || '');
        setCountry(user.country || '');
    }
  }, [user]);

  if (isLoading) {
    return (
        <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
  }

  if (!user) {
      return <LoginScreen />;
  }

  const handleUpdate = async () => {
      try {
          if (!name || !phone || !city) {
              alert('नाम, फोन और शहर अनिवार्य हैं।');
              return;
          }
          setIsUpdating(true);
          await updateProfile({ name, phone, city, country });
          alert('प्रोफ़ाइल सफलतापूर्वक अपडेट की गई');
      } catch (error: any) {
          alert(error.message || 'अपडेट विफल रहा');
      } finally {
          setIsUpdating(false);
      }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- Premium Sleek Header --- */}
        <LinearGradient
            colors={['#1A1A1A', '#000000']}
            style={[styles.headerGradient, { paddingTop: STATUSBAR_HEIGHT + 20 }]}
        >
            <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>मेरी प्रोफ़ाइल</Text>
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="power" size={20} color="#E31E24" />
                </TouchableOpacity>
            </View>

            <View style={styles.profileInfoBox}>
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400&auto=format&fit=crop' }} 
                        style={styles.avatar} 
                    />
                    <TouchableOpacity style={styles.cameraBadge}>
                        <Ionicons name="camera" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.userMeta}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={styles.userRoleTag}>
                        <Ionicons name={hasRegisteredChild ? "shield-checkmark" : "person"} size={12} color="#E31E24" />
                        <Text style={styles.userRoleText}>
                            {hasRegisteredChild ? 'अभिभावक (Parent)' : 'यूजर (Normal User)'}
                        </Text>
                    </View>
                </View>
            </View>
        </LinearGradient>

        {/* --- Selection Logic --- */}
        {hasRegisteredChild ? (
            <View style={styles.prideSection}>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>नन्हा पत्रकार - पैरेंट पोर्टल</Text>
                <TouchableOpacity 
                    activeOpacity={0.9}
                    style={styles.prideCard}
                    onPress={() => router.push('/nanhe-patrakar-portfolio')}
                >
                    <LinearGradient
                        colors={['#1A1A1A', '#2C2C2C']}
                        style={styles.prideGradient}
                    >
                        <View style={styles.prideTop}>
                            <Image 
                                source={{ uri: 'https://avatar.iran.liara.run/public/boy?username=Rohan' }} 
                                style={styles.childAvatar} 
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.childName}>रोहन ठाकुर</Text>
                                <Text style={styles.childBrief}>जूनियर रिपोर्टर • JH-NP-2026</Text>
                            </View>
                            <View style={styles.childVerified}>
                                <Ionicons name="ribbon" size={24} color="#E31E24" />
                            </View>
                        </View>
                        
                        <View style={styles.childStats}>
                            <View style={styles.statMini}>
                                <Text style={styles.statMiniVal}>05</Text>
                                <Text style={styles.statMiniLab}>खबरें</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statMini}>
                                <Text style={styles.statMiniVal}>2.4K</Text>
                                <Text style={styles.statMiniLab}>रीडर्स</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statMini}>
                                <Text style={styles.statMiniVal}>12</Text>
                                <Text style={styles.statMiniLab}>शाबाशी</Text>
                            </View>
                        </View>

                        <View style={styles.prideFooter}>
                            <Text style={styles.prideActionText}>पोर्टफोलियो और आईडी कार्ड देखें</Text>
                            <Ionicons name="arrow-forward-circle" size={20} color="#E31E24" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.prideSection}>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>नन्हा पत्रकार कार्यक्रम</Text>
                <TouchableOpacity 
                    activeOpacity={0.9}
                    style={styles.prideCard}
                    onPress={() => router.push('/nanhe-patrakar')}
                >
                    <View style={[styles.prideGradient, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' }]}>
                        <View style={styles.prideTop}>
                            <View style={[styles.childVerified, { backgroundColor: '#FDECEC' }]}>
                                <Ionicons name="megaphone" size={24} color="#E31E24" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.childName, { color: '#1A1A1A' }]}>क्या आपका बच्चा रिपोर्टर बनेगा?</Text>
                                <Text style={[styles.childBrief, { color: '#666' }]}>हिमाचल के बच्चों का अपना मंच</Text>
                            </View>
                        </View>
                        <Text style={[styles.prideActionText, { marginBottom: 15, color: '#444', fontWeight: '500' }]}>
                           अपने बच्चे का आज ही "नन्हा पत्रकार" में रजिस्ट्रेशन करें और उसे नई पहचान दें।
                        </Text>
                        <View style={[styles.prideFooter, { borderTopColor: '#f0f0f0' }]}>
                            <Text style={[styles.prideActionText, { color: '#E31E24' }]}>पूरी जानकारी देखें</Text>
                            <Ionicons name="chevron-forward-circle" size={20} color="#E31E24" />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )}

        {/* --- Form Section --- */}
        <View style={styles.formSection}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>अकाउंट जानकारी</Text>
            
            <View style={[styles.inputGroup, { backgroundColor: '#fff', borderColor: '#eee' }]}>
                <Ionicons name="person-outline" size={20} color="#E31E24" style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputFloatingLabel}>पूरा नाम</Text>
                    <TextInput 
                        style={[styles.input, { color: '#1A1A1A' }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="नाम दर्ज करें"
                    />
                </View>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: '#fff', borderColor: '#eee' }]}>
                <Ionicons name="call-outline" size={20} color="#E31E24" style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputFloatingLabel}>फ़ोन नंबर</Text>
                    <TextInput 
                        style={[styles.input, { color: '#1A1A1A' }]}
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.updateBtn, isUpdating && { opacity: 0.7 }]}
                onPress={handleUpdate}
            >
                <View style={[styles.btnGradient, { backgroundColor: '#1A1A1A' }]}>
                    <Text style={styles.updateBtnText}>प्रोफ़ाइल अपडेट करें</Text>
                </View>
            </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  // Header Styles
  headerGradient: {
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E31E24',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userMeta: { gap: 4 },
  userName: { color: '#fff', fontSize: 24, fontWeight: '900' },
  userRoleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userRoleText: { color: '#FFD700', fontSize: 11, fontWeight: '800' },

  // Pride Section
  prideSection: { paddingHorizontal: 20, marginTop: 30 },
  sectionLabel: { fontSize: 14, fontWeight: '900', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 },
  prideCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1e3c72',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  prideGradient: { padding: 20 },
  prideTop: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  childAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)' },
  childName: { color: '#fff', fontSize: 18, fontWeight: '900' },
  childBrief: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  childVerified: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  childStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 15,
  },
  statMini: { flex: 1, alignItems: 'center' },
  statMiniVal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  statMiniLab: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700' },
  statDivider: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'center' },
  
  prideFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12 },
  prideActionText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Form Section
  formSection: { paddingHorizontal: 20, marginTop: 30 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 15,
  },
  inputIcon: { marginRight: 15 },
  inputFloatingLabel: { fontSize: 10, fontWeight: '800', color: '#888', textTransform: 'uppercase', marginBottom: 2 },
  input: { fontSize: 16, fontWeight: '700', paddingVertical: 2 },
  rowInputs: { flexDirection: 'row', gap: 15 },
  
  updateBtn: { marginTop: 10, borderRadius: 20, overflow: 'hidden' },
  btnGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});

