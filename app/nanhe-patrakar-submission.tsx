import { createSubmission, getMyChildProfiles, getNanhePatrakarTopics } from '@/api/server';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

const CONTENT_TYPES = [
    { id: 'ARTICLE', label: 'लेख (Article)', icon: 'document-text' },
    { id: 'POEM', label: 'कविता (Poem)', icon: 'reader' },
    { id: 'EXPERIENCE', label: 'अनुभव (Exp)', icon: 'bulb' },
    { id: 'SPEECH', label: 'भाषण (Speech)', icon: 'mic' },
    { id: 'SONG', label: 'गीत (Song)', icon: 'musical-notes' },
    { id: 'VIDEO', label: 'वीडियो (Video)', icon: 'videocam' },
];

const LANGUAGES = [
    { id: 'HINDI', label: 'Hindi' },
    { id: 'ENGLISH', label: 'English' },
    { id: 'PAHARI', label: 'Pahari / Local' }
];

export default function NanhePatrakarSubmissionScreen() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // --- State ---
    const [childId, setChildId] = useState<string | null>(null);
    const [topics, setTopics] = useState<any[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState('ARTICLE');
    const [selectedLang, setSelectedLang] = useState('HINDI');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaDescription, setMediaDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Media States
    const [images, setImages] = useState<any[]>([]); // Max 2
    const [videos, setVideos] = useState<any[]>([]); // Max 2

    useEffect(() => {
        if (user) {
            getData();
        }
    }, [user]);

    const getData = async () => {
        try {
            const [topicsRes, profileRes] = await Promise.all([
                getNanhePatrakarTopics(),
                getMyChildProfiles()
            ]);

            if (topicsRes.data && topicsRes.data.status && topicsRes.data.data) {
                const topicsList = topicsRes.data.data.results || topicsRes.data.data;
                if (Array.isArray(topicsList)) {
                    setTopics(topicsList);
                    if (topicsList.length > 0) {
                        setSelectedTopic(topicsList[0].id.toString());
                    }
                }
            }

            if (profileRes.data && profileRes.data.status && profileRes.data.data.results.length > 0) {
                setChildId(profileRes.data.data.results[0].id.toString());
            }
        } catch (err) {
            console.error("Error fetching submission data:", err);
        }
    };

    // --- Handlers ---
    const handleImagePicker = async () => {
        if (images.length >= 2) {
            Alert.alert("सीमा समाप्त", "आप अधिकतम 2 फोटो अपलोड कर सकते हैं।");
            return;
        }

        Alert.alert(
            "फोटो जोड़ें",
            "आप फोटो कहाँ से लेना चाहेंगे?",
            [
                { text: "कैमरा (Camera)", onPress: () => captureMedia('images') },
                { text: "गैलरी (Gallery)", onPress: () => pickMediaFromGallery('images') },
                { text: "रद्द करें", style: "cancel" }
            ]
        );
    };

    const handleVideoPicker = async () => {
        if (videos.length >= 2) {
            Alert.alert("सीमा समाप्त", "आप अधिकतम 2 वीडियो अपलोड कर सकते हैं।");
            return;
        }

        Alert.alert(
            "वीडियो जोड़ें",
            "आप वीडियो कहाँ से लेना चाहेंगे?",
            [
                { text: "कैमरा (Camera)", onPress: () => captureMedia('videos') },
                { text: "गैलरी (Gallery)", onPress: () => pickMediaFromGallery('videos') },
                { text: "रद्द करें", style: "cancel" }
            ]
        );
    };

    const pickMediaFromGallery = async (type: 'images' | 'videos') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("अनुमति आवश्यक", "कृपया गैलरी का उपयोग करने की अनुमति दें।");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: type === 'images', 
            quality: 0.7, // Initial quality before manipulation
            videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (type === 'images') {
                // Resize and Compress Image to reduce MBs
                const manipulated = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 1200 } }], // Standard HD width
                    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
                );
                setImages(prev => [...prev, manipulated].slice(0, 2));
            } else {
                setVideos(prev => [...prev, result.assets[0]].slice(0, 2));
            }
        }
    };

    const captureMedia = async (type: 'images' | 'videos') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("अनुमति आवश्यक", "कैमरा इस्तेमाल करने की अनुमति दें।");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: type === 'images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: type === 'images',
            quality: 0.7,
            videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (type === 'images') {
                // Resize and Compress Camera Photo
                const manipulated = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 1200 } }],
                    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
                );
                setImages(prev => [...prev, manipulated].slice(0, 2));
            } else {
                setVideos(prev => [...prev, result.assets[0]].slice(0, 2));
            }
        }
    };

    const handleSubmission = async () => {
        if (!title.trim()) { Alert.alert("शीर्षक खाली है", "कृपया खबर का शीर्षक लिखें।"); return; }
        if (!content.trim()) { Alert.alert("सामग्री खाली है", "कृपया कुछ शब्द लिखें।"); return; }
        if (!selectedTopic) { Alert.alert("विषय चुनें", "कृपया एक विषय चुनें।"); return; }
        if (!childId) { Alert.alert("त्रुटि", "बच्चे की प्रोफाइल नहीं मिली।"); return; }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('child_id', childId);
            formData.append('topic_id', selectedTopic);
            formData.append('title', title);
            formData.append('content_type', selectedType);
            formData.append('language', selectedLang);
            formData.append('content_text', content);
            formData.append('media_description', mediaDescription);

            images.forEach((img, index) => {
                const uriParts = img.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append(`image_${index + 1}`, {
                    uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                    name: `photo_${index + 1}.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            });

            videos.forEach((vid, index) => {
                const uriParts = vid.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append(`video_${index + 1}`, {
                    uri: Platform.OS === 'ios' ? vid.uri.replace('file://', '') : vid.uri,
                    name: `video_${index + 1}.${fileType}`,
                    type: `video/${fileType}`,
                } as any);
            });

            const response = await createSubmission(formData);
            if (response.data && response.data.status) {
                Alert.alert("सफलता!", "खबर समीक्षा के लिए भेज दी गई है।", [{ text: "ठीक है", onPress: () => router.back() }]);
            } else {
                throw new Error("Submission failed");
            }
        } catch (err) {
            Alert.alert("त्रुटि", "खबर भेजने में विफल।");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <View style={styles.loading}><ActivityIndicator size="large" color={theme.primary} /></View>;

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>अपनी सामग्री भेजें</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={styles.authPromptWrapper}>
                    <Text style={[styles.authTitle, { color: theme.text }]}>लॉगिन आवश्यक है</Text>
                    <TouchableOpacity style={[styles.authLoginBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/auth/login' as any)}>
                        <Text style={styles.authLoginBtnText}>लॉगिन करें</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} />

            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>अपनी सामग्री भेजें</Text>
                <TouchableOpacity onPress={handleSubmission} disabled={isSubmitting}>
                    {isSubmitting ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={[styles.sendBtn, { color: theme.primary }]}>SUBMIT</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>विषय (Topic) चुनें</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={{ gap: 10, paddingRight: 40 }}>
                        {Array.isArray(topics) && topics.map((t) => (
                            <TouchableOpacity 
                                key={t.id} 
                                onPress={() => setSelectedTopic(t.id.toString())}
                                style={[styles.chip, { backgroundColor: selectedTopic === t.id.toString() ? theme.primary : 'transparent', borderColor: theme.primary }]}
                            >
                                <Text style={[styles.chipText, { color: selectedTopic === t.id.toString() ? '#fff' : theme.text }]}>{t.title_hindi || t.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 20 }]}>माध्यम (Type)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={{ gap: 10, paddingRight: 40 }}>
                        {CONTENT_TYPES.map((item) => (
                            <TouchableOpacity 
                                key={item.id}
                                onPress={() => setSelectedType(item.id)}
                                style={[styles.typeItem, { backgroundColor: selectedType === item.id ? theme.primary : theme.primary + '10', borderColor: theme.primary }]}
                            >
                                <Ionicons name={item.icon as any} size={18} color={selectedType === item.id ? '#fff' : theme.primary} />
                                <Text style={[styles.typeText, { color: selectedType === item.id ? '#fff' : theme.text }]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>खबर का शीर्षक</Text>
                        <TextInput style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.borderColor }]} placeholder="यहाँ शीर्षक लिखें..." value={title} onChangeText={setTitle} />
                    </View>

                    <View style={styles.langContainer}>
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity key={lang.id} style={[styles.chip, { backgroundColor: selectedLang === lang.id ? theme.primary + '20' : 'transparent', borderColor: theme.borderColor }]} onPress={() => setSelectedLang(lang.id)}>
                                <Text style={[styles.chipText, { color: selectedLang === lang.id ? theme.primary : theme.text }]}>{lang.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.editorContainer, { borderColor: theme.borderColor }]}>
                        <TextInput style={[styles.editor, { color: theme.text }]} placeholder="अपनी खबर यहाँ लिखें..." multiline textAlignVertical="top" value={content} onChangeText={setContent} />
                    </View>

                    <Text style={[styles.sectionLabel, { color: theme.text }]}>मीडिया अपलोड</Text>
                    <View style={styles.uploadRow}>
                        <TouchableOpacity style={[styles.uploadBox, { borderColor: theme.borderColor }]} onPress={handleImagePicker}>
                            <Ionicons name="camera" size={24} color={theme.primary} />
                            <Text style={styles.uploadText}>फोटो ({images.length}/2)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.uploadBox, { borderColor: theme.borderColor }]} onPress={handleVideoPicker}>
                            <Ionicons name="videocam" size={24} color={theme.primary} />
                            <Text style={styles.uploadText}>वीडियो ({videos.length}/2)</Text>
                        </TouchableOpacity>
                    </View>

                    {(images.length > 0 || videos.length > 0) && (
                        <View style={styles.previewGrid}>
                            {[...images, ...videos].map((file, idx) => (
                                <View key={idx} style={styles.thumbWrapper}>
                                    <Image source={{ uri: file.uri }} style={styles.thumb} />
                                    <TouchableOpacity style={styles.removeBtn} onPress={() => idx < images.length ? setImages(images.filter((_, i) => i !== idx)) : setVideos(videos.filter((_, i) => i !== (idx - images.length)))}>
                                        <Ionicons name="close-circle" size={22} color="#E31E24" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={[styles.fieldGroup, { marginTop: 20 }]}>
                        <Text style={styles.inputLabel}>मीडिया का विवरण (Optional)</Text>
                        <TextInput style={[styles.descInput, { color: theme.text, borderColor: theme.borderColor }]} placeholder="फोटो/वीडियो के बारे में लिखें..." value={mediaDescription} onChangeText={setMediaDescription} multiline />
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    backButton: { padding: 4 },
    sendBtn: { fontSize: 15, fontWeight: '900' },
    scrollContent: { padding: 20 },
    sectionLabel: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
    horizontalList: { marginBottom: 15 },
    chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    chipText: { fontSize: 13, fontWeight: '700' },
    typeItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 1, gap: 6 },
    typeText: { fontSize: 13, fontWeight: '700' },
    fieldGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 5, opacity: 0.6 },
    titleInput: { fontSize: 20, fontWeight: '700', paddingVertical: 8, borderBottomWidth: 1.5 },
    langContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    editorContainer: { borderRadius: 15, borderWidth: 1, minHeight: 200, padding: 12, marginBottom: 20 },
    editor: { fontSize: 16, flex: 1 },
    descInput: { borderRadius: 12, borderWidth: 1, padding: 10, minHeight: 60, textAlignVertical: 'top' },
    uploadRow: { flexDirection: 'row', gap: 15, marginTop: 5 },
    uploadBox: { flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 15, padding: 15, alignItems: 'center', gap: 5 },
    uploadText: { fontSize: 12, fontWeight: '700' },
    previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 15 },
    thumbWrapper: { width: (width - 60) / 3, height: (width - 60) / 3, borderRadius: 10, overflow: 'hidden' },
    thumb: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: 'white', borderRadius: 11 },
    authPromptWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    authTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
    authLoginBtn: { paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12 },
    authLoginBtnText: { color: '#fff', fontWeight: '800' }
});
