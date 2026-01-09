import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
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

const SUBMISSION_TYPES = [
    { id: 'article', label: 'लेख (Article)', icon: 'document-text' },
    { id: 'poem', label: 'कविता (Poem)', icon: 'reader' },
    { id: 'experience', label: 'अनुभव (Exp)', icon: 'bulb' },
    { id: 'speech', label: 'भाषण (Speech)', icon: 'mic' },
    { id: 'song', label: 'गीत (Song)', icon: 'musical-notes' },
    { id: 'video', label: 'वीडियो (Video)', icon: 'videocam' },
];

const LANGUAGES = ['Hindi', 'English', 'Pahari / Local'];

export default function NanhePatrakarSubmissionScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // --- State ---
    const [selectedType, setSelectedType] = useState('article');
    const [selectedLang, setSelectedLang] = useState('Hindi');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isMediaUploaded, setIsMediaUploaded] = useState(false);

    // --- Handlers ---
    const pickMedia = async (type: 'images' | 'videos') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("अनुमति आवश्यक", "कृपया गैलरी का उपयोग करने की अनुमति दें।");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: type === 'images' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setIsMediaUploaded(true);
            Alert.alert("सफलता", "फाइल चुन ली गई है!");
        }
    };

    const handleSubmission = () => {
        if (!title || !content) {
            Alert.alert("Submission Incomplete", "Please add a title and some content for your work.");
            return;
        }
        
        Alert.alert(
            "Submitted!",
            "आपकी सामग्री संपादकीय समीक्षा (Editorial Review) के लिए भेज दी गई है। 4 दिनों में आपको अपडेट मिलेगा।",
            [{ text: "OK", onPress: () => router.back() }]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* --- Header --- */}
            <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>अपनी सामग्री भेजें</Text>
                <TouchableOpacity onPress={handleSubmission}>
                    <Text style={[styles.sendBtn, { color: theme.primary }]}>SUBMIT</Text>
                </TouchableOpacity>
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
                    {/* --- Submission Type Selection --- */}
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>चुनें: किस तरह की सामग्री है?</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={styles.typeList}
                        contentContainerStyle={{ gap: 12, paddingRight: 40 }}
                    >
                        {SUBMISSION_TYPES.map((item) => (
                            <TouchableOpacity 
                                key={item.id}
                                onPress={() => setSelectedType(item.id)}
                                style={[
                                    styles.typeItem, 
                                    { 
                                        backgroundColor: selectedType === item.id ? theme.primary : theme.primary + '10',
                                        borderColor: theme.primary 
                                    }
                                ]}
                            >
                                <Ionicons 
                                    name={item.icon as any} 
                                    size={20} 
                                    color={selectedType === item.id ? '#fff' : theme.primary} 
                                />
                                <Text style={[styles.typeText, { color: selectedType === item.id ? '#fff' : theme.text }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* --- Metadata Section --- */}
                    <View style={styles.fieldGroup}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>शीर्षक (Title)</Text>
                        <TextInput 
                            style={[styles.titleInput, { color: theme.text, borderBottomColor: theme.borderColor }]}
                            placeholder="आज का विषय लिखें..."
                            placeholderTextColor={theme.placeholderText}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.langContainer}>
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity 
                                key={lang} 
                                style={[styles.langChip, { backgroundColor: selectedLang === lang ? theme.primary + '20' : 'transparent', borderColor: theme.borderColor }]}
                                onPress={() => setSelectedLang(lang)}
                            >
                                <Text style={[styles.langText, { color: selectedLang === lang ? theme.primary : theme.text }]}>{lang}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* --- Editor Section --- */}
                    <View style={[styles.editorContainer, { backgroundColor: theme.primary + '03', borderColor: theme.borderColor }]}>
                        <TextInput 
                            style={[styles.editor, { color: theme.text }]}
                            placeholder="यहाँ अपना लेख या शब्द लिखें..."
                            placeholderTextColor={theme.placeholderText}
                            multiline
                            textAlignVertical="top"
                            value={content}
                            onChangeText={setContent}
                        />
                    </View>

                    {/* --- Media Upload Section --- */}
                    <View style={styles.mediaSection}>
                        <Text style={[styles.sectionLabel, { color: theme.text }]}>मीडिया / फाइल अपलोड करें (Upload)</Text>
                        <View style={styles.mediaOptionsRow}>
                             <TouchableOpacity 
                                style={[styles.mediaOptionBox, { borderColor: theme.borderColor, backgroundColor: theme.primary + '05' }]}
                                onPress={() => pickMedia('images')}
                             >
                                <Ionicons name="images-outline" size={24} color={theme.primary} />
                                <Text style={[styles.mediaOptionText, { color: theme.text }]}>Photo/Doc</Text>
                             </TouchableOpacity>

                             <TouchableOpacity 
                                style={[styles.mediaOptionBox, { borderColor: theme.borderColor, backgroundColor: theme.primary + '05' }]}
                                onPress={() => pickMedia('videos')}
                             >
                                <Ionicons name="videocam-outline" size={24} color={theme.primary} />
                                <Text style={[styles.mediaOptionText, { color: theme.text }]}>Video/Audio</Text>
                             </TouchableOpacity>
                        </View>

                        {isMediaUploaded && (
                            <View style={[styles.uploadStatus, { backgroundColor: theme.success + '15', borderColor: theme.success }]}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                                <Text style={[styles.statusText, { color: theme.success }]}>File selected successfully!</Text>
                                <TouchableOpacity onPress={() => setIsMediaUploaded(false)}>
                                    <Ionicons name="close-circle" size={20} color={theme.placeholderText} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.reviewNote}>
                        <Ionicons name="information-circle" size={18} color={theme.placeholderText} />
                        <Text style={[styles.noteText, { color: theme.placeholderText }]}>
                            संपादकीय टीम 4 दिनों के भीतर आपके लेख की समीक्षा करेगी।
                        </Text>
                    </View>

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
    headerTitle: { fontSize: 18, fontWeight: '800' },
    backButton: { padding: 4 },
    sendBtn: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    scrollContent: { padding: 20 },
    sectionLabel: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
    typeList: { marginBottom: 25 },
    typeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8,
    },
    typeText: { fontSize: 13, fontWeight: '700' },
    fieldGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 5, opacity: 0.6 },
    titleInput: {
        fontSize: 24,
        fontWeight: '700',
        paddingVertical: 10,
        borderBottomWidth: 1.5,
    },
    langContainer: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    langChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
    },
    langText: { fontSize: 12, fontWeight: '700' },
    editorContainer: {
        borderRadius: 20,
        borderWidth: 1,
        minHeight: 300,
        padding: 15,
        marginBottom: 20,
    },
    editor: {
        fontSize: 16,
        lineHeight: 24,
        flex: 1,
    },
    mediaSection: { marginBottom: 25 },
    mediaOptionsRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
    },
    mediaOptionBox: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    mediaOptionText: {
        fontSize: 12,
        fontWeight: '700',
    },
    uploadStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    reviewNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 12,
    },
    noteText: { fontSize: 12, flex: 1 },
});
