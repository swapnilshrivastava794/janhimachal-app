import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.primaryGradientStart, theme.primaryGradientEnd]}
        style={styles.headerBackground}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.headerBg} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
              <Text style={[styles.welcomeText, { color: theme.headerBg }]}>Welcome Back!</Text>
              <Text style={styles.subText}>Sign in to continue to DXB News</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.background, shadowColor: theme.cardShadow }]}>
              
              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Email or Username</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="mail-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Enter your email"
                          placeholderTextColor={theme.placeholderText}
                          value={email}
                          onChangeText={setEmail}
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Enter your password"
                          placeholderTextColor={theme.placeholderText}
                          secureTextEntry
                          value={password}
                          onChangeText={setPassword}
                      />
                  </View>
                  <TouchableOpacity style={styles.forgotBtn}>
                      <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot Password?</Text>
                  </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.loginBtn, isLoggingIn && { opacity: 0.7 }]}
                activeOpacity={0.8}
                disabled={isLoggingIn}
                onPress={async () => {
                    try {
                        if (!email || !password) {
                            alert('Please enter both email and password');
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
                        alert(error.message || 'Login failed');
                    } finally {
                        setIsLoggingIn(false);
                    }
                }} // Real Login
              >
                  <LinearGradient
                    colors={[theme.secondaryGradientStart, theme.secondaryGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                      {isLoggingIn ? (
                          <ActivityIndicator size="small" color={theme.headerBg} />
                      ) : (
                          <Text style={[styles.loginBtnText, { color: theme.headerBg }]}>Log In</Text>
                      )}
                  </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                  <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
                  <Text style={[styles.orText, { color: theme.placeholderText }]}>OR</Text>
                  <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
              </View>

              <View style={styles.socialContainer}>
                  <TouchableOpacity style={[styles.socialBtn, { borderColor: theme.borderColor }]}>
                      <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }} style={styles.socialIcon} />
                      <Text style={[styles.socialText, { color: theme.text }]}>Continue with Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.socialBtn, { borderColor: theme.borderColor }]}>
                      <FontAwesome name="twitter" size={24} color="#1DA1F2" />
                      <Text style={[styles.socialText, { color: theme.text }]}>Continue with Twitter</Text>
                  </TouchableOpacity>
              </View>

          </View>

          <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.placeholderText }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push({
                  pathname: '/auth/signup',
                  params: { redirect }
              } as any)}>
                  <Text style={[styles.signupText, { color: theme.primary }]}>Sign Up</Text>
              </TouchableOpacity>
          </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: height * 0.4,
  },
  scrollContent: {
      flexGrow: 1,
      paddingTop: 60,
      paddingHorizontal: 20,
  },
  backBtn: {
      marginBottom: 30,
  },
  headerContent: {
      marginBottom: 40,
  },
  welcomeText: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 8,
  },
  subText: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
  },
  card: {
      borderRadius: 24,
      padding: 24,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      marginBottom: 30,
  },
  inputGroup: {
      marginBottom: 20,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      marginLeft: 4,
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
      flex: 1,
      fontSize: 16,
      height: '100%',
  },
  forgotBtn: {
      alignSelf: 'flex-end',
      marginTop: 8,
  },
  forgotText: {
      fontSize: 13,
      fontWeight: '600',
  },
  loginBtn: {
      marginTop: 10,
      marginBottom: 24,
      borderRadius: 12,
      overflow: 'hidden',
  },
  btnGradient: {
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
  },
  loginBtnText: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
  },
  dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
  },
  divider: {
      flex: 1,
      height: 1,
  },
  orText: {
      marginHorizontal: 16,
      fontSize: 12,
      fontWeight: '600',
  },
  socialContainer: {
      gap: 16,
  },
  socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 16,
      gap: 12,
      width: '100%',
  },
  socialIcon: {
      width: 24,
      height: 24,
  },
  socialText: {
      fontWeight: '600',
      fontSize: 16,
  },
  footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 40,
  },
  footerText: {
      fontSize: 14,
  },
  signupText: {
      fontSize: 14,
      fontWeight: '800',
  },
});
