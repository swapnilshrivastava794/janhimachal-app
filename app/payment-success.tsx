import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PaymentSuccessScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Auto redirect after 5 seconds (Optional)
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         router.dismissAll();
    //         router.replace('/(tabs)');
    //     }, 5000);
    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark-sharp" size={60} color="#fff" />
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Payment Successful!</Text>
                <Text style={[styles.subtitle, { color: theme.placeholderText }]}>
                    Your registration for <Text style={{ fontWeight: '700', color: theme.primary }}>Nanhe Patrakar</Text> is complete.
                </Text>

                <View style={[styles.receiptCard, { backgroundColor: theme.background, borderColor: theme.borderColor }]}>
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.placeholderText }]}>Transaction ID</Text>
                        <Text style={[styles.value, { color: theme.text }]}>#TXN123456789</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.placeholderText }]}>Amount Paid</Text>
                        <Text style={[styles.value, { color: theme.text, fontSize: 18, fontWeight: '700' }]}>₹250.00</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: theme.placeholderText }]}>Date</Text>
                        <Text style={[styles.value, { color: theme.text }]}>{new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                <Text style={[styles.infoText, { color: theme.text }]}>
                    Welcome to the Jan Himachal Family! Your digital certificate will be available in your profile shortly.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.homeButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                        // Reset navigation stack to home
                        router.push('/(tabs)' as any);
                    }}
                >
                    <Text style={styles.buttonText}>Go to Home</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        width: '100%',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4CAF50', // Success Green
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        elevation: 10,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    receiptCard: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 30,
        backgroundColor: '#fff', // Or dynamic theme card bg
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 12,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoText: {
        textAlign: 'center',
        fontSize: 14,
        opacity: 0.8,
        lineHeight: 20,
    },
    footer: {
        width: '100%',
        padding: 20,
        paddingBottom: 40,
    },
    homeButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
