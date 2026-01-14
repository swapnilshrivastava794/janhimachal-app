import { getDistricts, updateChildProfile } from '@/api/server';
import constant from '@/constants/constant';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
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

export default function EditChildProfileScreen() {
    const { profileData } = useLocalSearchParams<{ profileData: string }>();
    const insets = useSafeAreaInsets();
    const initialProfile = profileData ? JSON.parse(profileData) : null;
    
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [name, setName] = useState(initialProfile?.name || '');
    const [dob, setDob] = useState(initialProfile?.date_of_birth || '2020-01-01');
    const [age, setAge] = useState(initialProfile?.age?.toString() || '8');
    const [gender, setGender] = useState(initialProfile?.gender || 'M');
    const [schoolName, setSchoolName] = useState(initialProfile?.school_name || '');
    const [district, setDistrict] = useState(initialProfile?.district?.name || '');
    const [districtId, setDistrictId] = useState(initialProfile?.district?.id?.toString() || '');
    const [photo, setPhoto] = useState<string | null>(initialProfile?.photo ? (initialProfile.photo.startsWith('http') ? initialProfile.photo : `${constant.appBaseUrl}${initialProfile.photo}`) : null);
    const [idProof, setIdProof] = useState<string | null>(initialProfile?.id_proof ? (initialProfile.id_proof.startsWith('http') ? initialProfile.id_proof : `${constant.appBaseUrl}${initialProfile.id_proof}`) : null);

    const [districts, setDistricts] = useState<any[]>([]);
    const [showDistrictModal, setShowDistrictModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchDistricts();
    }, []);

    const fetchDistricts = async () => {
        try {
            const res = await getDistricts();
            if (res.data && res.data.status) {
                setDistricts(res.data.data.results);
            }
        } catch (err) {
            console.log("Error fetching districts");
        }
    };

    const pickImage = async (field: 'photo' | 'id_proof') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (field === 'photo') setPhoto(result.assets[0].uri);
            else setIdProof(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        if (!name || !schoolName || !districtId) {
            Alert.alert("Error", "Please fill required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                name,
                date_of_birth: dob,
                age,
                gender,
                school_name: schoolName,
                district_id: districtId,
            };

            if (photo && !photo.startsWith('http')) {
                payload.photo = {
                    uri: photo,
                    name: 'child_photo.jpg',
                    type: 'image/jpeg',
                } as any;
            }

            if (idProof && !idProof.startsWith('http')) {
                payload.id_proof = {
                    uri: idProof,
                    name: 'id_proof.jpg',
                    type: 'image/jpeg',
                } as any;
            }

            const res = await updateChildProfile(initialProfile.id, payload);
            if (res.data && res.data.status) {
                Alert.alert("Success", "Profile updated successfully");
                router.back();
            } else {
                Alert.alert("Error", res.data?.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update error:", err);
            Alert.alert("Error", "Something went wrong while updating");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>प्रोफ़ाइल संपादित करें (Edit Profile)</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Photos Section */}
                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={() => pickImage('photo')} style={styles.avatarMain}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.avatarImg} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '10' }]}>
                                    <Ionicons name="camera" size={30} color={theme.primary} />
                                </View>
                            )}
                            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                                <Ionicons name="pencil" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.photoLabel, { color: theme.placeholderText }]}>प्रोफ़ाइल फ़ोटो बदलें</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>नाम (Full Name)</Text>
                            <TextInput 
                                style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter name"
                                placeholderTextColor={theme.placeholderText}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>उम्र (Age)</Text>
                                <TextInput 
                                    style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.text }]}>लिंग (Gender)</Text>
                                <View style={styles.genderRow}>
                                    <TouchableOpacity 
                                        onPress={() => setGender('M')}
                                        style={[styles.genderBtn, gender === 'M' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    >
                                        <Text style={[styles.genderText, gender === 'M' && { color: '#fff' }]}>M</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => setGender('F')}
                                        style={[styles.genderBtn, gender === 'F' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    >
                                        <Text style={[styles.genderText, gender === 'F' && { color: '#fff' }]}>F</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>स्कूल का नाम (School Name)</Text>
                            <TextInput 
                                style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                value={schoolName}
                                onChangeText={setSchoolName}
                                placeholder="School name"
                                placeholderTextColor={theme.placeholderText}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>ज़िला (District)</Text>
                            <TouchableOpacity 
                                onPress={() => setShowDistrictModal(true)}
                                style={[styles.input, { borderColor: theme.borderColor, justifyContent: 'center' }]}
                            >
                                <Text style={{ color: district ? theme.text : theme.placeholderText }}>
                                    {district || "Select District"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>पहचान पत्र (ID Proof)</Text>
                            <TouchableOpacity 
                                onPress={() => pickImage('id_proof')}
                                style={[styles.idProofBox, { borderColor: theme.borderColor, backgroundColor: theme.primary + '03' }]}
                            >
                                {idProof ? (
                                    <Image source={{ uri: idProof }} style={styles.idProofImg} />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="cloud-upload-outline" size={30} color={theme.placeholderText} />
                                        <Text style={{ color: theme.placeholderText }}>Upload ID Proof</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                            onPress={handleUpdate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>बदलाव सुरक्षित करें (Save Changes)</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: insets.bottom + 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* District Modal */}
            <Modal visible={showDistrictModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select District</Text>
                            <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList 
                            data={districts}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.districtItem}
                                    onPress={() => {
                                        setDistrict(item.name);
                                        setDistrictId(item.id.toString());
                                        setShowDistrictModal(false);
                                    }}
                                >
                                    <Text style={[styles.districtText, { color: theme.text }]}>{item.name}</Text>
                                    {districtId === item.id.toString() && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    scrollContent: { padding: 24 },
    photoSection: { alignItems: 'center', marginBottom: 30 },
    avatarMain: { width: 100, height: 100, position: 'relative' },
    avatarImg: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    photoLabel: { marginTop: 10, fontSize: 12, fontWeight: '600' },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 13, fontWeight: '700', marginLeft: 4 },
    input: { height: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15 },
    row: { flexDirection: 'row' },
    genderRow: { flexDirection: 'row', gap: 10 },
    genderBtn: { flex: 1, height: 50, borderWidth: 1, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderColor: '#ddd' },
    genderText: { fontWeight: '700' },
    idProofBox: { height: 150, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, overflow: 'hidden' },
    idProofImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 5 },
    saveBtn: { height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '60%', padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800' },
    districtItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    districtText: { fontSize: 16, fontWeight: '500' },
});
