import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Constants.statusBarHeight;

const AGE_GROUPS = [
  {
    title: 'समूह A (8–10 वर्ष)',
    desc: 'सरल सोच, अच्छे संस्कार, अपने आसपास की दुनिया',
    color: '#FF9800', 
    icon: 'happy-outline' as const,
  },
  {
    title: 'समूह B (11–13 वर्ष)',
    desc: 'सही-गलत की पहचान, सामाजिक समझ',
    color: '#2196F3', 
    icon: 'school-outline' as const,
  },
  {
    title: 'समूह C (14–16 वर्ष)',
    desc: 'जिम्मेदारी, नेतृत्व और सामाजिक दृष्टि',
    color: '#4CAF50', 
    icon: 'people-outline' as const,
  },
];

const CONTENT_TYPES = [
  'लेख (Article)', 'कविता (Poem)', 'अनुभव (Exp)', 
  'भाषण (Speech)', 'गीत (Song)', 'वीडियो (Video)'
];

export default function NanhePatrakarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const hasRegisteredChild = !!user && user?.user_type === 'nanhe_patrakar';

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: STATUSBAR_HEIGHT }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
         </TouchableOpacity>
         <Text style={[styles.headerTitle, { color: theme.text }]}>Nanhe Patrakar Guide</Text>
         <View style={{ width: 28 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Enhanced Hero Banner */}
          <LinearGradient
            colors={['#E31E24', '#8E1417']}
            style={styles.heroBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
              <View style={styles.heroContent}>
                  <View style={styles.heroBadge}>
                      <Text style={styles.heroBadgeText}>JAN HIMACHAL PRESENTS</Text>
                  </View>
                  <Text style={styles.heroTitle}>नन्हे पत्रकार</Text>
                  <Text style={styles.heroSubtitle}>भविष्य के पत्रकारों का मंच</Text>
              </View>
              <Ionicons name="megaphone" size={140} color="rgba(255,255,255,0.15)" style={styles.heroIcon} />
          </LinearGradient>

          <View style={styles.mainWrapper}>
              {/* What is it Section */}
              <View style={styles.contentSection}>
                  <View style={styles.sectionHeaderRow}>
                      <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
                      <Text style={[styles.sectionHeading, { color: theme.text }]}>कार्यक्रम क्या है?</Text>
                  </View>
                  <Text style={[styles.descText, { color: theme.text }]}>
                    यह एक संपादकीय सहभागिता कार्यक्रम है, जिसका उद्देश्य हिमाचल प्रदेश के बच्चों को लेखन, विचार और अभिव्यक्ति के माध्यम से समाज से जोड़ना है।
                  </Text>
              </View>

              {/* High Visibility Registration Button */}
              <View style={[styles.inlineCTA, { marginBottom: 25 }]}>
                  {hasRegisteredChild ? (
                      <TouchableOpacity 
                        style={[styles.mainButton, { backgroundColor: '#4CAF50' }]}
                        activeOpacity={0.8}
                        onPress={() => router.push('/nanhe-patrakar-submission' as any)} 
                      > 
                         <Text style={styles.mainButtonText}>अपनी खबर भेजें (Submit News)</Text>
                         <Ionicons name="send" size={20} color="#fff" />
                      </TouchableOpacity>
                  ) : (
                      <TouchableOpacity 
                        style={[styles.mainButton, { backgroundColor: theme.primary }]}
                        activeOpacity={0.8}
                        onPress={() => router.push('/nanhe-patrakar-registration' as any)} 
                      > 
                         <Text style={[styles.mainButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>रजिस्ट्रेशन के लिए आगे बढ़ें</Text>
                         <Ionicons name="arrow-forward" size={20} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                      </TouchableOpacity>
                  )}
              </View>

              {/* Eligibility Icons */}
              <View style={styles.eligibilityGrid}>
                  <View style={[styles.eBox, { backgroundColor: theme.primary + '08', borderColor: theme.borderColor }]}>
                      <Ionicons name="calendar" size={24} color={theme.primary} />
                      <Text style={[styles.eLabel, { color: theme.text }]}>8 से 16 वर्ष</Text>
                      <Text style={styles.eSub}>आयु सीमा</Text>
                  </View>
                  <View style={[styles.eBox, { backgroundColor: theme.primary + '08', borderColor: theme.borderColor }]}>
                      <Ionicons name="location" size={24} color={theme.primary} />
                      <Text style={[styles.eLabel, { color: theme.text }]}>हिमाचल प्रदेश</Text>
                      <Text style={styles.eSub}>क्षेत्र</Text>
                  </View>
              </View>

              {/* Age Group Cards */}
              <Text style={[styles.sectionHeading, { color: theme.text, marginBottom: 15 }]}>आयु वर्ग और लेखन स्तर</Text>
              {AGE_GROUPS.map((group, index) => (
                  <View key={index} style={[styles.modernGroupCard, { backgroundColor: (theme as any).card || '#fff', borderColor: theme.borderColor }]}>
                      <View style={[styles.groupColorBar, { backgroundColor: group.color }]} />
                      <View style={styles.groupCardContent}>
                          <View style={styles.groupHeader}>
                              <Text style={[styles.groupTitleText, { color: theme.text }]}>{group.title}</Text>
                              <Ionicons name={group.icon} size={20} color={group.color} />
                          </View>
                          <Text style={[styles.groupDescText, { color: theme.placeholderText }]}>{group.desc}</Text>
                      </View>
                  </View>
              ))}

              {/* Fee and Benefits Card */}
              <View style={[styles.premiumFeeCard, { backgroundColor: theme.primary }]}>
                  <View style={styles.feeHeaderRow}>
                      <Text style={[styles.feeLabel, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>सहभागिता शुल्क</Text>
                      <Text style={[styles.feeValue, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>₹599</Text>
                  </View>
                  <View style={[styles.feeDivider, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }]} />
                  <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-done-circle" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                      <Text style={[styles.benefitText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>संपादकीय समीक्षा और सुधार</Text>
                  </View>
                  <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-done-circle" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                      <Text style={[styles.benefitText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>App पर आधिकारिक प्रकाशन अवसर</Text>
                  </View>
                  <View style={styles.benefitRow}>
                      <Ionicons name="checkmark-done-circle" size={18} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                      <Text style={[styles.benefitText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>दक्षता प्रमाण-पत्र (Certificate)</Text>
                  </View>
              </View>

              <View style={styles.quoteBox}>
                  <Ionicons name="chatbox-ellipses-outline" size={24} color={theme.primary + '30'} style={styles.quoteIcon} />
                  <Text style={[styles.quoteText, { color: theme.text }]}>
                    "नन्हे पत्रकार केवल लेखन का मंच नहीं, बल्कि हिमाचल के बच्चों के लिए एक सोचने, समझने और जिम्मेदार बनने की यात्रा है।"
                  </Text>
              </View>

              {/* Bottom Spacer */}
              <View style={{ height: 40 }} />
          </View>
          <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 15,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
  },
  backButton: {
      padding: 4,
  },
  headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.5,
  },
  scrollContent: {
      // paddingBottom handled by View spacer
  },
  heroBanner: {
      padding: 30,
      minHeight: 220,
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
  },
  heroBadge: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      marginBottom: 10,
  },
  heroBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
  },
  heroContent: {
      zIndex: 5,
  },
  heroTitle: {
      fontSize: 36,
      fontWeight: '900',
      color: '#fff',
  },
  heroSubtitle: {
      fontSize: 18,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '600',
  },
  heroIcon: {
      position: 'absolute',
      right: -10,
      bottom: -10,
      opacity: 0.8,
  },
  mainWrapper: {
      padding: 20,
  },
  contentSection: {
      marginBottom: 25,
  },
  sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  indicator: {
      width: 4,
      height: 18,
      borderRadius: 2,
      marginRight: 10,
  },
  sectionHeading: {
      fontSize: 18,
      fontWeight: '800',
  },
  descText: {
      fontSize: 15,
      lineHeight: 24,
      opacity: 0.8,
  },
  eligibilityGrid: {
      flexDirection: 'row',
      gap: 15,
      marginBottom: 30,
  },
  eBox: {
      flex: 1,
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: 'center',
      gap: 4,
  },
  eLabel: {
      fontSize: 15,
      fontWeight: '800',
      marginTop: 5,
  },
  eSub: {
      fontSize: 11,
      opacity: 0.5,
      fontWeight: '600',
  },
  modernGroupCard: {
      flexDirection: 'row',
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 15,
      overflow: 'hidden',
      height: 90,
  },
  groupColorBar: {
      width: 6,
      height: '100%',
  },
  groupCardContent: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
  },
  groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
  },
  groupTitleText: {
      fontSize: 15,
      fontWeight: '800',
  },
  groupDescText: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500',
  },
  premiumFeeCard: {
      borderRadius: 24,
      padding: 24,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 6,
  },
  feeHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  feeLabel: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
      opacity: 0.8,
  },
  feeValue: {
      color: '#fff',
      fontSize: 32,
      fontWeight: '900',
  },
  feeDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginVertical: 15,
  },
  benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
  },
  benefitText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
  },
  quoteBox: {
      marginTop: 40,
      padding: 20,
      alignItems: 'center',
      position: 'relative',
  },
  quoteIcon: {
      position: 'absolute',
      top: 0,
      left: 10,
  },
  quoteText: {
      textAlign: 'center',
      fontSize: 14,
      fontStyle: 'italic',
      lineHeight: 22,
      fontWeight: '500',
      opacity: 0.7,
  },
  inlineCTA: {
      paddingBottom: 20,
  },
  mainButton: {
      paddingVertical: 18,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
  },
  mainButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '900',
  },
});
