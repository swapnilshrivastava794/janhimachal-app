import { enrollNanhePatrakar, getDistricts } from '@/api/server';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


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

  const { user, isLoading, updateUserType, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();

  // --- Form State ---
  const [studentName, setStudentName] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [selectedGender, setSelectedGender] = useState('M'); // M, F, O

  const [guardianName, setGuardianName] = useState(user?.name || '');
  const [guardianPhone, setGuardianPhone] = useState(user?.phone || '');
  const [parentIdProof, setParentIdProof] = useState<string | null>(null);
  const [childIdProof, setChildIdProof] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState<{ id: number, name: string, name_hindi: string | null }[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(true);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtId, setDistrictId] = useState<string | null>(null);

  // Validation errors for inline display
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Track if user is already enrolled on server but payment pending
  const [isEnrolled, setIsEnrolled] = useState(false);



  // --- Fetch Districts ---
  React.useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await getDistricts();
      //   console.log('🏘️ Districts Response:', JSON.stringify(response.data, null, 2));

      // Robust Extraction
      if (response.data && response.data.status && response.data.data && response.data.data.results) {
        setDistricts(response.data.data.results);
      } else if (response.data && response.data.results) {
        setDistricts(response.data.results);
      } else if (Array.isArray(response.data)) {
        setDistricts(response.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // Pre-fill guardian info when user data is available
  React.useEffect(() => {
    if (user) {
      if (!guardianName) {
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        setGuardianName(fullName || user.name || '');
      }
      if (!guardianPhone) setGuardianPhone(user.phone || '');
    }
  }, [user]);


  // --- Handlers ---
  const pickImage = async (type: 'parent' | 'child') => {
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

    const title = type === 'parent' ? "अभिभावक का पहचान पत्र" : "बच्चे का पहचान पत्र";

    Alert.alert(
      title,
      "Select an option to upload ID proof",
      [
        {
          text: "Camera",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              if (type === 'parent') setParentIdProof(result.assets[0].uri);
              else setChildIdProof(result.assets[0].uri);
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected Enum usage
              allowsEditing: false,
              quality: 0.6,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              if (type === 'parent') setParentIdProof(result.assets[0].uri);
              else setChildIdProof(result.assets[0].uri);
            }
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // Payment is now handled via external link
  const handlePaymentOnly = async () => {
    // setIsSubmitting(true);
    // try {
    //   // Open external payment link
    //   await Linking.openURL(constant.nanhePatrakarPaymentLink);
    //   Alert.alert(
    //     'भुगतान के लिए रीडायरेक्ट',
    //     'भुगतान पूरा होने के बाद कृपया ऐप पर वापस आएं और थोड़ी देर में प्रोफ़ाइल रिफ्रेश करें।',
    //     [{ text: 'ठीक है', onPress: () => refreshProfile() }]
    //   );
    // } catch (err: any) {
    //   Alert.alert('त्रुटि', 'भुगतान लिंक खोलने में समस्या हुई।');
    // } finally {
    //   setIsSubmitting(false);
    // }
    Alert.alert('Registration Completed', 'Profile will be updated soon.');
    refreshProfile();
  };

  const handleSubmit = async () => {
    // 1. If already enrolled, just retry payment
    if (isEnrolled) {
      await handlePaymentOnly();
      return;
    }

    // 2. Consolidated Validation
    const validationErrors: string[] = [];
    if (!studentName) validationErrors.push('• छात्र का नाम');
    if (!selectedAgeGroup) validationErrors.push('• आयु वर्ग');
    if (!schoolName) validationErrors.push('• स्कूल का नाम');
    if (!district) validationErrors.push('• ज़िला');
    if (!city) validationErrors.push('• शहर/गाँव');
    if (!guardianName) validationErrors.push('• अभिभावक का नाम');
    if (!guardianPhone || guardianPhone.length < 10) validationErrors.push('• 10 अंकों का मोबाइल नंबर');
    if (!parentIdProof) validationErrors.push('• अभिभावक ID Proof');
    if (!childIdProof) validationErrors.push('• बच्चे की फोटो');
    if (!agreeTerms) validationErrors.push('• शर्तों की स्वीकृति');

    if (validationErrors.length > 0) {
      Alert.alert(
        'कुछ जानकारी अधूरी है',
        `कृपया ये भरें:\n\n${validationErrors.join('\n')}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const d_id = districtId || "1";

      // Calculate approximate DOB based on age group
      const currentYear = new Date().getFullYear();
      let birthYear = currentYear - 9; // Default for Group A
      if (selectedAgeGroup === 'B') birthYear = currentYear - 12;
      else if (selectedAgeGroup === 'C') birthYear = currentYear - 15;
      const calculatedDOB = `${birthYear}-06-15`; // Mid-year approximation

      const payload: any = {
        mobile: guardianPhone,
        city: city,
        district_id: d_id,
        terms_accepted: "true",
        child_name: studentName,
        child_date_of_birth: calculatedDOB,
        child_age: selectedAgeGroup === 'A' ? "9" : selectedAgeGroup === 'B' ? "12" : "15",
        child_district_id: d_id,
        child_gender: selectedGender,
        child_school_name: schoolName,
      };

      // Handle Image Uploads
      if (parentIdProof) {
        payload.parent_id_proof = {
          uri: parentIdProof,
          name: 'parent_id_proof.jpg',
          type: 'image/jpeg',
        };
      }

      if (childIdProof) {
        payload.child_id_proof = {
          uri: childIdProof,
          name: 'child_id_proof.jpg',
          type: 'image/jpeg',
        };
        payload.child_photo = {
          uri: childIdProof,
          name: 'child_photo.jpg',
          type: 'image/jpeg',
        };
      }

      const enrollRes = await enrollNanhePatrakar(payload);
      // console.log('📝 Enrollment Response:', JSON.stringify(enrollRes.data, null, 2));

      if (enrollRes.data && enrollRes.data.status === true) {
        // Enrollment Success - Refresh profile immediately
        await refreshProfile();
        setIsEnrolled(true);
        await handlePaymentOnly(); // Proceed to payment
      } else {
        // Handle "User already enrolled" specifically
        if (enrollRes.data?.message === "User already enrolled" || enrollRes.data?.message?.includes("already")) {
          // console.log("ℹ️ User was already enrolled. Marking state as enrolled and retrying payment.");
          setIsEnrolled(true);
          await handlePaymentOnly(); // Proceed to payment
        } else {
          throw new Error(enrollRes.data?.message || 'Enrollment failed');
        }
      }
    } catch (error: any) {
      console.error('Enrollment Error:', error);
      if (!error.message?.includes("already enrolled")) {
        Alert.alert('पंजीकरण विफल', error.message || 'Server error');
      } else {
        // Fallback just in case the error throws before logic above catches it
        setIsEnrolled(true);
        // await handlePaymentOnly();
        Alert.alert('Registration Received', 'Process will be updated soon.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // --- Auth Guard UI ---
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>रजिस्ट्रेशन</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.authPromptWrapper}>
          <View style={[styles.authCard, { backgroundColor: theme.primary + '08', borderColor: theme.borderColor }]}>
            <View style={[styles.authIconCircle, { backgroundColor: theme.primary }]}>
              <Ionicons name="lock-closed" size={32} color={colorScheme === 'dark' ? '#000' : '#fff'} />
            </View>
            <Text style={[styles.authTitle, { color: theme.text }]}>लॉगिन आवश्यक है</Text>
            <Text style={[styles.authDesc, { color: theme.text }]}>
              नन्हे पत्रकार कार्यक्रम में पंजीकरण करने के लिए आपको जन हिमाचल अकाउंट से लॉगिन करना होगा।
            </Text>

            <TouchableOpacity
              style={[styles.authLoginBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push({
                pathname: '/auth/login',
                params: { redirect: '/nanhe-patrakar-registration' }
              } as any)}
            >
              <Text style={[styles.authLoginBtnText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>लॉगिन / साइन-अप करें</Text>
              <Ionicons name="arrow-forward" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.authCancelBtn}
            >
              <Text style={[styles.authCancelText, { color: theme.placeholderText }]}>बाद में करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (

    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* --- District Selection Modal --- */}
      <Modal visible={showDistrictModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>ज़िला (District) चुनें</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            {isLoadingDistricts ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} />
            ) : (
              <FlatList
                data={districts}
                keyExtractor={(item: { id: number, name: string, name_hindi: string | null }) => item.id.toString()}
                renderItem={({ item }: { item: { id: number, name: string, name_hindi: string | null } }) => (
                  <TouchableOpacity
                    style={[styles.districtItem, { borderBottomColor: theme.borderColor }]}
                    onPress={() => {
                      setDistrict(item.name);
                      setDistrictId(item.id.toString());
                      setShowDistrictModal(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.districtItemText, { color: theme.text }]}>{item.name}</Text>
                      {item.name_hindi && (
                        <Text style={{ fontSize: 12, color: theme.placeholderText }}>{item.name_hindi}</Text>
                      )}
                    </View>
                    {districtId === item.id.toString() && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* --- Header --- */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, flex: 1, marginLeft: 10 }]}>नन्हे पत्रकार पंजीकरण</Text>
        <View style={{ width: 24 }} />
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
              <Text style={[styles.infoBadgeText, { color: '#000' }]}>EDITORIAL PROGRAM</Text>
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
              <TouchableOpacity
                style={[styles.input, { flex: 1, marginRight: 10, borderColor: theme.borderColor, justifyContent: 'center' }]}
                onPress={() => setShowDistrictModal(true)}
              >
                <Text style={{ color: district ? theme.text : theme.placeholderText }}>
                  {district || "ज़िला चुनें"}
                </Text>
              </TouchableOpacity>
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

          {/* --- Gender Selection --- */}
          <View style={styles.sectionSpacer} />
          <Text style={[styles.sectionHeading, { color: theme.text }]}>2.5 लिंग (Gender)</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
            {[
              { id: 'M', label: 'लड़का (Male)', icon: 'male' },
              { id: 'F', label: 'लड़की (Female)', icon: 'female' },
              { id: 'O', label: 'अन्य (Other)', icon: 'person' }
            ].map((g) => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelectedGender(g.id)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: selectedGender === g.id ? theme.primary : theme.borderColor,
                  backgroundColor: selectedGender === g.id ? theme.primary + '15' : theme.background,
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Ionicons name={g.icon as any} size={20} color={selectedGender === g.id ? theme.primary : theme.placeholderText} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: selectedGender === g.id ? theme.primary : theme.text }}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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

            {/* --- PARENT ID PROOF UPLOAD --- */}
            <View style={styles.inputBox}>
              <Text style={styles.label}>अभिभावक का पहचान पत्र (Parent ID Proof)</Text>
              {parentIdProof ? (
                <View style={[styles.previewBox, { borderColor: theme.borderColor }]}>
                  <Image source={{ uri: parentIdProof }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setParentIdProof(null)}>
                    <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadWrapper, { borderColor: theme.borderColor, backgroundColor: theme.primary + '05' }]}
                  onPress={() => pickImage('parent')}
                >
                  <Ionicons name="person-outline" size={32} color={theme.primary} />
                  <Text style={[styles.uploadTitle, { color: theme.text }]}>Guardian ID Proof (JPEG/PNG)</Text>
                  <Text style={styles.uploadSub}>आधार कार्ड या अन्य सरकारी ID</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* --- CHILD PHOTO UPLOAD --- */}
            <View style={styles.inputBox}>
              <Text style={styles.label}>बच्चे की फोटो (Child Profile Photo)</Text>
              {childIdProof ? (
                <View style={[styles.previewBox, { borderColor: theme.borderColor }]}>
                  <Image source={{ uri: childIdProof }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setChildIdProof(null)}>
                    <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadWrapper, { borderColor: theme.borderColor, backgroundColor: theme.primary + '05' }]}
                  onPress={() => pickImage('child')}
                >
                  <Ionicons name="camera-outline" size={32} color={theme.primary} />
                  <Text style={[styles.uploadTitle, { color: theme.text }]}>Child Photo (JPEG/PNG)</Text>
                  <Text style={styles.uploadSub}>बच्चे की स्पष्ट पासपोर्ट साइज फोटो अपलोड करें</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* --- Section 4: Fee & Terms --- */}
          <View style={styles.sectionSpacer} />
          <View style={[styles.feeCard, { backgroundColor: theme.primary }]}>
            <View style={styles.feeTop}>
              <Text style={[styles.feeTitle, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>सहभागिता शुल्क</Text>
              <Text style={[styles.feePrice, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>₹369</Text>
            </View>
            <Text style={[styles.feeNote, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>शामिल है: संपादकीय समीक्षा, डिजिटल प्रमाण-पत्र और प्रकाशन अवसर</Text>
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
            style={[styles.finalBtn, { backgroundColor: theme.primary, opacity: (agreeTerms && !isSubmitting) ? 1 : 0.6 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colorScheme === 'dark' ? '#000' : '#fff'} />
            ) : (
              <Text style={[styles.finalBtnText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>
                {isEnrolled ? "भुगतान पुनः प्रयास करें (Retry Payment)" : "रजिस्टर करें और भुगतान करें"}
              </Text>
            )}
          </TouchableOpacity>


          <View style={{ height: insets.bottom + 80 }} />
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

  // Auth Guard Styles
  authPromptWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
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
  authTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  authLoginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  authCancelBtn: {
    paddingVertical: 10,
  },
  authCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  districtItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


