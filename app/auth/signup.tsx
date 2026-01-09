import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

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
              <Text style={[styles.welcomeText, { color: theme.headerBg }]}>Create Account</Text>
              <Text style={styles.subText}>Join DXB News Network today</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.background, shadowColor: theme.cardShadow }]}>
              
              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="person-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Ex. John Doe"
                          placeholderTextColor={theme.placeholderText}
                          value={name}
                          onChangeText={setName}
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="mail-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Your email address"
                          placeholderTextColor={theme.placeholderText}
                          keyboardType="email-address"
                          value={email}
                          onChangeText={setEmail}
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="call-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Ex. 9876543210"
                          placeholderTextColor={theme.placeholderText}
                          keyboardType="phone-pad"
                          value={phone}
                          onChangeText={setPhone}
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>City</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="location-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Ex. Dubai"
                          placeholderTextColor={theme.placeholderText}
                          value={city}
                          onChangeText={setCity}
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Country</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="globe-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Ex. UAE"
                          placeholderTextColor={theme.placeholderText}
                          value={country}
                          onChangeText={setCountry}
                      />
                  </View>
              </View>

              <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                  <View style={[styles.inputContainer, { borderColor: theme.borderColor }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={theme.placeholderText} style={styles.inputIcon} />
                      <TextInput 
                          style={[styles.input, { color: theme.text }]}
                          placeholder="Create a strong password"
                          placeholderTextColor={theme.placeholderText}
                          secureTextEntry
                          value={password}
                          onChangeText={setPassword}
                      />
                  </View>
              </View>

              <View style={styles.termsContainer}>
                  <Ionicons name="checkbox" size={24} color={theme.primary} />
                  <Text style={[styles.termsText, { color: theme.placeholderText }]}>
                      I agree to the <Text style={{ color: theme.primary, fontWeight: '700' }}>Terms of Service</Text> and <Text style={{ color: theme.primary, fontWeight: '700' }}>Privacy Policy</Text>
                  </Text>
              </View>

              <TouchableOpacity 
                style={[styles.loginBtn, isSigningUp && { opacity: 0.7 }]}
                activeOpacity={0.8}
                disabled={isSigningUp}
                onPress={async () => {
                    try {
                        if (!name || !email || !password || !phone || !city || !country) {
                            alert('Please fill all fields');
                            return;
                        }
                        setIsSigningUp(true);
                        await signup({ name, email, password, phone, city, country });
                        router.replace('/(tabs)/profile');
                    } catch (error: any) {
                        alert(error.message || 'Signup failed');
                    } finally {
                        setIsSigningUp(false);
                    }
                }}
              >
                  <LinearGradient
                    colors={[theme.secondaryGradientStart, theme.secondaryGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                      {isSigningUp ? (
                          <ActivityIndicator size="small" color={theme.headerBg} />
                      ) : (
                          <Text style={[styles.loginBtnText, { color: theme.headerBg }]}>Sign Up</Text>
                      )}
                  </LinearGradient>
              </TouchableOpacity>

          </View>

          <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.placeholderText }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                  <Text style={[styles.signupText, { color: theme.primary }]}>Log In</Text>
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
      height: height * 0.35,
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
      marginBottom: 30,
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
      marginBottom: 16,
  },
  label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      marginLeft: 4,
  },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
      flex: 1,
      fontSize: 16,
      height: '100%',
  },
  termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
  },
  termsText: {
      fontSize: 13,
      flex: 1,
      lineHeight: 18,
  },
  loginBtn: {
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
