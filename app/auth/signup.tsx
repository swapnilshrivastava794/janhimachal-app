import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { redirect } = useLocalSearchParams();
  const theme = Colors[colorScheme ?? 'light'];
  
  const { signup } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

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
            {/* Header Section */}
            <View style={styles.headerSection}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                
                <View style={styles.brandingContainer}>
                    <Text style={[styles.appName, { color: theme.primary }]}>Jan Himachal</Text>
                    <Text style={[styles.welcomeText, { color: theme.text }]}>नया अकाउंट बनाएँ</Text>
                    <Text style={[styles.subText, { color: theme.placeholderText }]}>Create your account to continue</Text>
                </View>
            </View>

            {/* Direct Signup Form */}
            <View style={styles.formContainer}>
                
                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="person-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="नाम (First Name)"
                        placeholderTextColor={theme.placeholderText}
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                </View>

                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="person-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="उपनाम (Last Name)"
                        placeholderTextColor={theme.placeholderText}
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </View>

                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="at-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="यूजरनेम (Username)"
                        placeholderTextColor={theme.placeholderText}
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>
                <Text style={{ fontSize: 11, color: theme.primary, marginTop: -8, marginBottom: 12, marginLeft: 4 }}>
                    * कृपया अपना यूजरनेम याद रखें, भविष्य में लॉगिन के लिए (Remember your username for future login)
                </Text>

                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="mail-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="ईमेल (Email Address)"
                        placeholderTextColor={theme.placeholderText}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                    <TextInput 
                        style={[styles.input, { color: theme.text }]}
                        placeholder="पासवर्ड (Create Password)"
                        placeholderTextColor={theme.placeholderText}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <View style={styles.termsContainer}>
                    <Ionicons name="checkbox" size={22} color={theme.primary} />
                    <Text style={[styles.termsText, { color: theme.placeholderText }]}>
                        मै सहभागिता की <Text style={{ color: theme.primary, fontWeight: '700' }}>शर्तों</Text> और <Text style={{ color: theme.primary, fontWeight: '700' }}>नियमों</Text> से सहमत हूँ।
                    </Text>
                </View>

                <TouchableOpacity 
                    style={[styles.loginBtn, isSigningUp && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    disabled={isSigningUp}
                    onPress={async () => {
                        try {
                            if (!firstName || !lastName || !username || !email || !password) {
                                alert('कृपया सभी जानकारी भरें');
                                return;
                            }
                            setIsSigningUp(true);
                            await signup({ firstName, lastName, username, email, password });
                            if (redirect) {
                                router.replace(redirect as any);
                            } else {
                                router.replace('/(tabs)/profile');
                            }
                        } catch (error: any) {
                            alert(error.message || 'पंजीकरण विफल रहा');
                        } finally {
                            setIsSigningUp(false);
                        }
                    }}
                >
                    <LinearGradient
                        colors={['#E31E24', '#B71C1C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        {isSigningUp ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginBtnText}>साइन अप करें (Sign Up)</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.placeholderText }]}>पहले से अकाउंट है? (Already have account?)</Text>
                <TouchableOpacity onPress={() => router.push({
                    pathname: '/auth/login',
                    params: { redirect }
                } as any)}>
                    <Text style={[styles.signupText, { color: theme.primary }]}>लॉगिन करें (Log In)</Text>
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
      marginBottom: 30,
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
      marginTop: 0,
  },
  appName: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 8,
  },
  welcomeText: {
      fontSize: 26,
      fontWeight: '800',
      marginBottom: 4,
  },
  subText: {
      fontSize: 14,
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
      height: 56,
      marginBottom: 12,
  },
  inputIcon: {
      marginRight: 12,
  },
  input: {
      flex: 1,
      fontSize: 15,
      height: '100%',
  },
  termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      paddingHorizontal: 4,
      gap: 10,
  },
  termsText: {
      fontSize: 12,
      flex: 1,
      lineHeight: 18,
  },
  loginBtn: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#E31E24',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      marginTop: 10,
  },
  btnGradient: {
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
  },
  loginBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
  },
  footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 30,
  },
  footerText: {
      fontSize: 13,
  },
  signupText: {
      fontSize: 13,
      fontWeight: '800',
  },
});
