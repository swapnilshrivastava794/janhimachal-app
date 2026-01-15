import { getDistricts } from '@/api/server';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import LoginScreen from '../auth/login';
import constant from '@/constants/constant';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { user, parentProfile, isLoading, logout, updateProfile, refreshProfile } = useAuth();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [idProofImage, setIdProofImage] = useState<string | null>(null);
  
  const [districts, setDistricts] = useState<any[]>([]);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if child is registered as nanhe_patrakar
  const isNanhePatrakar = (!!user && user?.user_type === 'nanhe_patrakar'); 

  useEffect(() => {
    refreshProfile();
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
        setIsLoadingDistricts(true);
        const res = await getDistricts();
        if (res.data && res.data.status) {
            setDistricts(res.data.data.results || []);
        }
    } catch (err) {
        console.error("Error fetching districts:", err);
    } finally {
        setIsLoadingDistricts(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setIdProofImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (user) {
        setUsername(user.username || '');
        // Fallback to splitting user.name if first/last are missing
        const nameParts = (user.name || '').split(' ');
        setFirstName(user.first_name || nameParts[0] || '');
        setLastName(user.last_name || nameParts.slice(1).join(' ') || '');
        setEmail(user.email || '');
    }
    if (parentProfile) {
        if (parentProfile.mobile) setPhone(parentProfile.mobile);
        if (parentProfile.city) setCity(parentProfile.city);
        if (parentProfile.district) {
            setDistrict(parentProfile.district.name);
            setDistrictId(parentProfile.district.id.toString());
        }
        if (parentProfile.user) {
            setUsername(parentProfile.user.username || username);
            const pNameParts = (parentProfile.user.first_name || '').trim() ? [] : (parentProfile.user.username || '').split(' ');
            setFirstName(parentProfile.user.first_name || firstName || pNameParts[0] || '');
            setLastName(parentProfile.user.last_name || lastName || pNameParts.slice(1).join(' ') || '');
            setEmail(parentProfile.user.email || email);
        }
    }
  }, [user, parentProfile]);

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
          if (!username || !email || !firstName) {
              Alert.alert('त्रुटि', 'यूजरनेम, ईमेल और नाम अनिवार्य हैं।');
              return;
          }
          
          setIsUpdating(true);
          
          const payload: any = {
              username,
              first_name: firstName,
              last_name: lastName,
              email
          };

          if (isNanhePatrakar) {
              payload.mobile = phone;
              payload.city = city;
              payload.district = districtId;
              
              if (idProofImage && !idProofImage.startsWith('http')) {
                  payload.id_proof = {
                      uri: idProofImage,
                      name: 'id_proof.jpg',
                      type: 'image/jpeg',
                  };
              }
          }

          await updateProfile(payload);
          Alert.alert('सफलता', 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई');
      } catch (error: any) {
          Alert.alert('त्रुटि', error.message || 'अपडेट विफल रहा');
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
                        <Ionicons name="star" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.userMeta}>
                    <Text style={styles.userName}>
                        {(firstName || lastName) ? `${firstName} ${lastName}`.trim() : (user.name || user.username || 'User')}
                    </Text>
                    <View style={styles.userRoleTag}>
                        <Ionicons name={isNanhePatrakar ? "shield-checkmark" : "person"} size={12} color="#E31E24" />
                        <Text style={styles.userRoleText}>
                            {isNanhePatrakar ? 'अभिभावक (Parent)' : 'यूजर (Normal User)'}
                        </Text>
                    </View>
                </View>
            </View>
        </LinearGradient>

        {/* --- Selection Logic --- */}
        {isNanhePatrakar && parentProfile ? (
            <View style={styles.prideSection}>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>नन्हा पत्रकार - पैरेंट पोर्टल</Text>
                {parentProfile.children.map((child) => (
                    <TouchableOpacity 
                        key={child.id}
                        activeOpacity={0.9}
                        style={[styles.prideCard, { marginBottom: 15 }]}
                        onPress={() => router.push('/nanhe-patrakar-portfolio')}
                    >
                        <LinearGradient
                            colors={['#1A1A1A', '#2C2C2C']}
                            style={styles.prideGradient}
                        >
                            <View style={styles.prideTop}>
                                <Image 
                                    source={{ uri: child.photo ? `${constant.appBaseUrl}${child.photo}` : 'https://avatar.iran.liara.run/public/boy' }} 
                                    style={styles.childAvatar} 
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.childName}>{child.name}</Text>
                                    <Text style={styles.childBrief}>
                                        {parentProfile.program.name_hindi || parentProfile.program.name} • {parentProfile.district.name}
                                    </Text>
                                </View>
                                <View style={styles.childVerified}>
                                    <Ionicons name="ribbon" size={24} color="#E31E24" />
                                </View>
                            </View>
                            
                            <View style={styles.childStats}>
                                <View style={styles.statMini}>
                                    <Text style={styles.statMiniVal}>--</Text>
                                    <Text style={styles.statMiniLab}>खबरें</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statMini}>
                                    <Text style={styles.statMiniVal}>--</Text>
                                    <Text style={styles.statMiniLab}>रीडर्स</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statMini}>
                                    <Text style={styles.statMiniVal}>--</Text>
                                    <Text style={styles.statMiniLab}>शाबाशी</Text>
                                </View>
                            </View>

                            <View style={styles.prideFooter}>
                                <Text style={styles.prideActionText}>पोर्टफोलियो और आईडी कार्ड देखें</Text>
                                <Ionicons name="arrow-forward-circle" size={20} color="#E31E24" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        ) : !parentProfile && isNanhePatrakar ? (
            <View style={[styles.prideSection, { alignItems: 'center', padding: 20 }]}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={{ marginTop: 10, color: theme.placeholderText }}>प्रोफ़ाइल लोड हो रही है...</Text>
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
            
            <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, backgroundColor: '#fff', borderColor: '#eee' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputFloatingLabel}>First Name</Text>
                        <TextInput 
                            style={[styles.input, { color: '#1A1A1A' }]}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First Name"
                        />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, backgroundColor: '#fff', borderColor: '#eee' }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.inputFloatingLabel}>Last Name</Text>
                        <TextInput 
                            style={[styles.input, { color: '#1A1A1A' }]}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last Name"
                        />
                    </View>
                </View>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: '#fff', borderColor: '#eee' }]}>
                <Ionicons name="at-outline" size={20} color="#666" style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputFloatingLabel}>Username</Text>
                    <TextInput 
                        style={[styles.input, { color: '#1A1A1A' }]}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Username"
                    />
                </View>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: '#fff', borderColor: '#eee' }]}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.inputFloatingLabel}>इमेल</Text>
                    <TextInput 
                        style={[styles.input, { color: '#1A1A1A' }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        keyboardType="email-address"
                    />
                </View>
            </View>

            {isNanhePatrakar && (
                <>
                    <View style={[styles.inputGroup, { backgroundColor: '#fff', borderColor: '#eee' }]}>
                        <Ionicons name="call-outline" size={20} color="#E31E24" style={styles.inputIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputFloatingLabel}>फ़ोन नंबर</Text>
                            <TextInput 
                                style={[styles.input, { color: '#1A1A1A' }]}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, backgroundColor: '#fff', borderColor: '#eee' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputFloatingLabel}>शहर (City)</Text>
                                <TextInput 
                                    style={[styles.input, { color: '#1A1A1A' }]}
                                    value={city}
                                    onChangeText={setCity}
                                    placeholder="City"
                                />
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={[styles.inputGroup, { flex: 1, backgroundColor: '#fff', borderColor: '#eee' }]}
                            onPress={() => setShowDistrictModal(true)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputFloatingLabel}>जिला (District)</Text>
                                <Text style={[styles.input, { color: district ? '#1A1A1A' : '#999' }]}>
                                    {district || "चुनें"}
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.inputGroup, { backgroundColor: '#fff', borderColor: '#eee', alignItems: 'flex-start', paddingVertical: 15 }]}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.inputFloatingLabel}>पहचान पत्र (ID Proof)</Text>
                            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                                {idProofImage ? (
                                    <Image source={{ uri: idProofImage }} style={styles.uploadedImgPreview} />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                                        <Text style={styles.uploadText}>अपलोड करें</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}

            <TouchableOpacity 
                style={[styles.updateBtn, isUpdating && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={isUpdating}
            >
                <View style={[styles.btnGradient, { backgroundColor: '#1A1A1A' }]}>
                    {isUpdating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.updateBtnText}>प्रोफ़ाइल अपडेट करें</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>

        {/* --- District Modal --- */}
        <Modal visible={showDistrictModal} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>ज़िला चुनें</Text>
                        <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    {isLoadingDistricts ? (
                        <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} />
                    ) : (
                        <FlatList 
                            data={districts}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[styles.districtItem, { borderBottomColor: theme.borderColor }]}
                                    onPress={() => {
                                        setDistrict(item.name);
                                        setDistrictId(item.id.toString());
                                        setShowDistrictModal(false);
                                    }}
                                >
                                    <Text style={[styles.districtItemText, { color: theme.text }]}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>

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

  // Modal & District Helper Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  districtItem: { paddingVertical: 15, borderBottomWidth: 1 },
  districtItemText: { fontSize: 16, fontWeight: '600' },

  // Upload Styles
  uploadBox: { 
    width: '100%', 
    height: 120, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#eee', 
    borderStyle: 'dashed', 
    marginTop: 10,
    overflow: 'hidden'
  },
  uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadText: { fontSize: 12, color: '#666', marginTop: 5 },
  uploadedImgPreview: { width: '100%', height: '100%' },
});

