import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

const AGE_GROUPS = [
  {
    id: 'A',
    label: 'समूह A',
    age: '8–10 वर्ष',
    focus: 'सरल सोच, अच्छे संस्कार, अपने आसपास की दुनिया'
  },
  {
    id: 'B',
    label: 'समूह B',
    age: '11–13 वर्ष',
    focus: 'सही-गलत की पहचान, सामाजिक समझ'
  },
  {
    id: 'C',
    label: 'समूह C',
    age: '14–16 वर्ष',
    focus: 'जिम्मेदारी, नेतृत्व और सामाजिक दृष्टि'
  }
];

export default function NanhePatrakarRegistrationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  // --- Form State ---
  const [studentName, setStudentName] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [idProofImage, setIdProofImage] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);

  // --- Handlers ---
  const pickImage = async () => {
    // Request permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        "Permissions Required",
        "We need camera and gallery permissions to upload the ID proof."
      );
      return;
    }

    Alert.alert(
      "Upload ID Proof",
      "Select an option to upload guardian's ID",
      [
        { 
          text: "Camera", 
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });
            if (!result.canceled) {
              setIdProofImage(result.assets[0].uri);
            }
          } 
        },
        { 
          text: "Gallery", 
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            });
            if (!result.canceled) {
              setIdProofImage(result.assets[0].uri);
            }
          } 
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleSubmit = () => {
    if (!studentName || !selectedAgeGroup || !schoolName || !district || !city) {
        alert('कृपया छात्र की सभी जानकारी भरें।');
        return;
    }
    if (!guardianName || !guardianPhone || guardianPhone.length < 10) {
        alert('अभिभावक की सही जानकारी और 10 अंकों का मोबाइल नंबर भरें।');
        return;
    }
    if (!idProofImage) {
        alert('अभिभावक का पहचान पत्र (ID Proof) अपलोड करना अनिवार्य है।');
        return;
    }
    if (!agreeTerms) {
        alert('कृपया सहभागिता शर्तों और डिजिटल सहमति को स्वीकार करें।');
        return;
    }

    // Success - Proceed
    router.push('/payment-success' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* --- Header --- */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>नन्हे पत्रकार पंजीकरण</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity 
            onPress={() => router.push('/nanhe-patrakar-submission' as any)}
            style={{ padding: 4 }}
          >
            <Ionicons name="eye-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/nanhe-patrakar-portfolio' as any)}
            style={{ padding: 4 }}
          >
            <Ionicons name="person-circle-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/nanhe-patrakar-hub' as any)}
            style={{ padding: 4 }}
          >
            <Ionicons name="star-outline" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {/* --- Info Card --- */}
            <View style={[styles.infoCard, { backgroundColor: theme.primary + '08' }]}>
                <View style={styles.infoBadge}>
                    <Text style={[styles.infoBadgeText, { color: theme.primary }]}>EDITORIAL PROGRAM</Text>
                </View>
                <Text style={[styles.mainTitle, { color: theme.text }]}>नन्हे पत्रकार क्या है?</Text>
                <Text style={[styles.mainDesc, { color: theme.text }]}>
                    हिमाचल प्रदेश के बच्चों को लेखन और अभिव्यक्ति के माध्यम से समाज से जोड़ने वाली एक शैक्षिक पहल।
                </Text>
                
                {showFullInfo && (
                    <View style={styles.extraInfo}>
                         <View style={styles.infoRow}>
                            <Ionicons name="shield-checkmark" size={16} color={theme.success} />
                            <Text style={[styles.infoText, { color: theme.text }]}>आयु: 8-16 वर्ष | क्षेत्र: हिमाचल प्रदेश</Text>
                         </View>
                         <View style={styles.infoRow}>
                            <Ionicons name="newspaper" size={16} color={theme.primary} />
                            <Text style={[styles.infoText, { color: theme.text }]}>माध्यम: लेख, कविता, वीडियो, गीत</Text>
                         </View>
                    </View>
                )}

                <TouchableOpacity 
                    onPress={() => setShowFullInfo(!showFullInfo)}
                    style={styles.readMoreBtn}
                >
                    <Text style={[styles.readMoreText, { color: theme.primary }]}>
                        {showFullInfo ? 'कम दिखाएं' : 'पूरी जानकारी'}
                    </Text>
                    <Ionicons name={showFullInfo ? "chevron-up" : "chevron-down"} size={16} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* --- Section 1: Student --- */}
            <View style={styles.sectionSpacer} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>1. छात्र का विवरण</Text>
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
                <View style={styles.inputBox}>
                    <Text style={styles.label}>पूरा नाम</Text>
                    <TextInput 
                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                        placeholder="छात्र का नाम लिखें"
                        value={studentName}
                        onChangeText={setStudentName}
                    />
                </View>

                <View style={styles.inputBox}>
                    <Text style={styles.label}>स्कूल का नाम</Text>
                    <TextInput 
                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                        placeholder="स्कूल का नाम"
                        value={schoolName}
                        onChangeText={setSchoolName}
                    />
                </View>

                <View style={styles.row}>
                    <TextInput 
                        style={[styles.input, { flex: 1, marginRight: 10, color: theme.text, borderColor: theme.borderColor }]}
                        placeholder="ज़िला (District)"
                        value={district}
                        onChangeText={setDistrict}
                    />
                    <TextInput 
                        style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.borderColor }]}
                        placeholder="शहर/गाँव"
                        value={city}
                        onChangeText={setCity}
                    />
                </View>
            </View>

            {/* --- Section 2: Age Group --- */}
            <View style={styles.sectionSpacer} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>2. आयु वर्ग चुनें</Text>
            <View style={styles.ageGrid}>
                {AGE_GROUPS.map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        onPress={() => setSelectedAgeGroup(item.id)}
                        style={[
                            styles.ageCard, 
                            { 
                                borderColor: selectedAgeGroup === item.id ? theme.primary : theme.borderColor,
                                backgroundColor: selectedAgeGroup === item.id ? theme.primary + '10' : theme.background
                            }
                        ]}
                    >
                        <View style={styles.ageHeader}>
                            <Text style={styles.ageLabel}>{item.label}</Text>
                            <Text style={[styles.ageRange, { color: theme.primary }]}>{item.age}</Text>
                        </View>
                        <Text style={styles.ageFocus}>{item.focus}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* --- Section 3: Guardian --- */}
            <View style={styles.sectionSpacer} />
            <Text style={[styles.sectionHeading, { color: theme.text }]}>3. अभिभावक का विवरण</Text>
            <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
                <View style={styles.inputBox}>
                    <Text style={styles.label}>अभिभावक का नाम</Text>
                    <TextInput 
                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                        placeholder="नाम लिखें"
                        value={guardianName}
                        onChangeText={setGuardianName}
                    />
                </View>

                <View style={styles.inputBox}>
                    <Text style={styles.label}>मोबाइल नंबर</Text>
                    <View style={styles.phoneRow}>
                        <View style={[styles.prefix, { backgroundColor: theme.borderColor + '40', borderColor: theme.borderColor }]}>
                            <Text style={{ fontWeight: '700' }}>+91</Text>
                        </View>
                        <TextInput 
                            style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, color: theme.text, borderColor: theme.borderColor }]}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={guardianPhone}
                            onChangeText={setGuardianPhone}
                        />
                    </View>
                </View>

                {/* --- ID PROOF UPLOAD --- */}
                <View style={styles.inputBox}>
                    <Text style={styles.label}>पहचान पत्र (ID Proof)</Text>
                    {idProofImage ? (
                        <View style={[styles.previewBox, { borderColor: theme.borderColor }]}>
                            <Image source={{ uri: idProofImage }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setIdProofImage(null)}>
                                <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={[styles.uploadWrapper, { borderColor: theme.borderColor, backgroundColor: theme.primary + '05' }]}
                            onPress={pickImage}
                        >
                            <Ionicons name="camera-outline" size={32} color={theme.primary} />
                            <Text style={[styles.uploadTitle, { color: theme.text }]}>Upload ID Proof (JPEG/PNG)</Text>
                            <Text style={styles.uploadSub}>आधार कार्ड या अन्य कोई सरकारी ID</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* --- Section 4: Fee & Terms --- */}
            <View style={styles.sectionSpacer} />
            <View style={[styles.feeCard, { backgroundColor: theme.primary }]}>
                <View style={styles.feeTop}>
                    <Text style={styles.feeTitle}>सहभागिता शुल्क</Text>
                    <Text style={styles.feePrice}>₹599</Text>
                </View>
                <Text style={styles.feeNote}>शामिल है: संपादकीय समीक्षा, डिजिटल प्रमाण-पत्र और प्रकाशन अवसर</Text>
            </View>

            <TouchableOpacity 
                style={styles.consentRow} 
                onPress={() => setAgreeTerms(!agreeTerms)}
            >
                <Ionicons name={agreeTerms ? "checkbox" : "square-outline"} size={24} color={theme.primary} />
                <Text style={[styles.consentText, { color: theme.text }]}>
                    मैं पुष्टि करता हूँ कि जानकारी सही है। मैं अपने बच्चे को भाग लेने की अनुमति देता हूँ।
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.finalBtn, { backgroundColor: theme.primary, opacity: agreeTerms ? 1 : 0.6 }]}
                onPress={handleSubmit}
            >
                <Text style={styles.finalBtnText}>रजिस्टर करें और भुगतान करें</Text>
            </TouchableOpacity>

            <View style={{ height: Platform.OS === 'ios' ? 100 : 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backButton: { padding: 4 },
  scrollContent: { padding: 20 },
  infoCard: { borderRadius: 20, padding: 20 },
  infoBadge: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  infoBadgeText: { fontSize: 10, fontWeight: '800' },
  mainTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  mainDesc: { fontSize: 14, lineHeight: 22, opacity: 0.8 },
  extraInfo: { marginTop: 15, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, fontWeight: '500' },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 6 },
  readMoreText: { fontSize: 14, fontWeight: '700' },
  sectionSpacer: { height: 25 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  card: { borderRadius: 20, padding: 20, borderWidth: 1, gap: 18 },
  inputBox: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', marginLeft: 4 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15 },
  row: { flexDirection: 'row' },
  ageGrid: { gap: 12 },
  ageCard: { borderRadius: 20, borderWidth: 2, padding: 18 },
  ageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ageLabel: { fontSize: 16, fontWeight: '800' },
  ageRange: { fontSize: 14, fontWeight: '700' },
  ageFocus: { fontSize: 12, lineHeight: 18, opacity: 0.7 },
  phoneRow: { flexDirection: 'row' },
  prefix: { paddingHorizontal: 15, justifyContent: 'center', borderTopLeftRadius: 14, borderBottomLeftRadius: 14, borderWidth: 1, borderRightWidth: 0 },
  uploadWrapper: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 20, padding: 30, alignItems: 'center', gap: 10 },
  uploadTitle: { fontSize: 15, fontWeight: '700' },
  uploadSub: { fontSize: 12, opacity: 0.6 },
  previewBox: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', height: 180, position: 'relative' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  closeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', borderRadius: 15 },
  feeCard: { borderRadius: 24, padding: 25 },
  feeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feeTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  feePrice: { color: '#fff', fontSize: 28, fontWeight: '900' },
  feeNote: { color: '#fff', fontSize: 12, opacity: 0.9 },
  consentRow: { flexDirection: 'row', gap: 12, marginVertical: 25 },
  consentText: { flex: 1, fontSize: 13, lineHeight: 20 },
  finalBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  finalBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
