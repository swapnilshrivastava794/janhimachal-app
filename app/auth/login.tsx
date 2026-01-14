import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const { redirect } = useLocalSearchParams();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            {/* Header section with Logo/Title */}
            <View style={styles.headerSection}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                
                <View style={styles.brandingContainer}>
                    <Text style={[styles.appName, { color: theme.primary }]}>Jan Himachal</Text>
                    <Text style={[styles.welcomeText, { color: theme.text }]}>नमस्ते / Welcome</Text>
                    <Text style={[styles.subText, { color: theme.placeholderText }]}>अपने अकाउंट में लॉगिन करें</Text>
                </View>
            </View>

            {/* Direct Login Form */}
            <View style={styles.formContainer}>
                
                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="person-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="ईमेल या यूजरनेम (Email / Username)"
                        placeholderTextColor={theme.placeholderText}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="पासवर्ड (Password)"
                        placeholderTextColor={theme.placeholderText}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity style={styles.forgotBtn}>
                    <Text style={[styles.forgotText, { color: theme.primary }]}>पासवर्ड भूल गए? (Forgot Password?)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.loginBtn, isLoggingIn && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    disabled={isLoggingIn}
                    onPress={async () => {
                        try {
                            if (!email || !password) {
                                alert('कृपया ईमेल और पासवर्ड भरें');
                                return;
                            }
                            setIsLoggingIn(true);
                            await login(email, password);
                            if (redirect) {
                                router.replace(redirect as any);
                            } else {
                                router.replace('/(tabs)/profile');
                            }
                        } catch (error: any) {
                            alert(error.message || 'लॉगिन विफल रहा');
                        } finally {
                            setIsLoggingIn(false);
                        }
                    }}
                >
                    <LinearGradient
                        colors={['#E31E24', '#B71C1C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        {isLoggingIn ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginBtnText}>लॉगिन करें (Log In)</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* --- Social Logins Separated --- */}
                <View style={styles.dividerRow}>
                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                    <Text style={[styles.orText, { color: theme.placeholderText }]}>या अन्य माध्यम (OR)</Text>
                    <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.placeholderText }]}>अकाउंट नहीं है? (No account?)</Text>
                <TouchableOpacity onPress={() => router.push({
                    pathname: '/auth/signup',
                    params: { redirect }
                } as any)}>
                    <Text style={[styles.signupText, { color: theme.primary }]}>साइन अप (Sign Up)</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
  },
  headerSection: {
      paddingTop: 40,
      marginBottom: 40,
  },
  backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
  },
  brandingContainer: {
      marginTop: 10,
  },
  appName: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 10,
  },
  welcomeText: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 4,
  },
  subText: {
      fontSize: 15,
      fontWeight: '500',
  },
  formContainer: {
      flex: 1,
  },
  inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 60,
      marginBottom: 16,
  },
  inputIcon: {
      marginRight: 12,
  },
  input: {
      flex: 1,
      fontSize: 16,
      height: '100%',
  },
  forgotBtn: {
      alignSelf: 'flex-end',
      marginBottom: 30,
  },
  forgotText: {
      fontSize: 14,
      fontWeight: '600',
  },
  loginBtn: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#E31E24',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  },
  btnGradient: {
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
  },
  loginBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
  },
  dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 35,
  },
  divider: {
      flex: 1,
      height: 1,
  },
  orText: {
      marginHorizontal: 16,
      fontSize: 13,
      fontWeight: '600',
  },
  socialRow: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
  },
  socialIconBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 16,
      height: 56,
      gap: 10,
  },
  socialIcon: {
      width: 22,
      height: 22,
  },
  socialBtnText: {
      fontWeight: '600',
      fontSize: 14,
  },
  footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 40,
  },
  footerText: {
      fontSize: 14,
  },
  signupText: {
      fontSize: 14,
      fontWeight: '800',
  },
});
