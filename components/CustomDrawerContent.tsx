import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const handleSocialLink = (url: string) => {
    Linking.openURL(url);
  };

  const MenuItem = ({ icon, label, onPress, color }: { icon: any, label: string, onPress: () => void, color?: string }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: color ? `${color}15` : theme.headerBg }]}>
        <Ionicons name={icon} size={22} color={color || theme.text} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.icon} style={{ opacity: 0.5 }} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* Premium Header */}
        <LinearGradient
          colors={['#005CB9', '#003366']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        >
          <Image 
            source={require('@/assets/dxb-new.png')} 
            style={styles.drawerLogo} 
            resizeMode="contain"
          />
          
          {isLoggedIn ? (
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                <View style={styles.onlineBadge} />
              </View>
              <View style={styles.userTextContainer}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@janhimachal.com'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.guestInfo}>
              <Text style={styles.guestWelcome}>Welcome to</Text>
              <Text style={styles.guestWelcome}>Jan Himachal</Text>
              <Text style={styles.guestSub}>हिमाचल की आवाज़, हिमाचल के लिए</Text>
              <TouchableOpacity style={styles.loginBtnHeader} onPress={() => props.navigation.navigate('auth/login')}>
                <Text style={styles.loginBtnText}>Login / Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        <View style={styles.contentContainer}>
            {/* Main Navigation Group */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.icon }]}>MENU</Text>
            </View>
            
            <View style={[styles.menuGroup, { backgroundColor: theme.headerBg }]}>
                {/* Standard Drawer Items logic mapped to custom style or just explicit items */}
                <MenuItem icon="home-outline" label="Home" onPress={() => props.navigation.navigate('index')} color={theme.primary} />
                <MenuItem icon="videocam-outline" label="Videos" onPress={() => props.navigation.navigate('videos')} color="#E4405F" />
                <MenuItem icon="notifications-outline" label="Notifications" onPress={() => props.navigation.navigate('notifications')} color="#FDB813" />
                <MenuItem icon="person-outline" label="Profile" onPress={() => props.navigation.navigate('profile')} color="#1DA1F2" />
            </View>

            {/* Account & Settings Group */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.icon }]}>PREFERENCES</Text>
            </View>

            <View style={[styles.menuGroup, { backgroundColor: theme.headerBg }]}>
                <MenuItem icon="settings-outline" label="Settings" onPress={() => alert('Settings')} />
                <MenuItem icon="information-circle-outline" label="About Us" onPress={() => alert('About')} />
                <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => alert('Privacy')} />
            </View>

            {/* Auth Action */}
            {isLoggedIn && (
               <View style={{ marginTop: 20 }}>
                 <MenuItem icon="log-out-outline" label="Logout" onPress={() => logout()} color={theme.accent} />
               </View>
            )}

        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.borderColor, backgroundColor: theme.background }]}>
        <Text style={[styles.footerText, { color: theme.icon }]}>Follow us</Text>
        <View style={styles.socialRow}>
             <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocialLink('https://fb.com')}>
                <Ionicons name="logo-facebook" size={20} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#1DA1F2' }]} onPress={() => handleSocialLink('https://twitter.com')}>
                <Ionicons name="logo-twitter" size={20} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#E4405F' }]} onPress={() => handleSocialLink('https://instagram.com')}>
                <Ionicons name="logo-instagram" size={20} color="#fff" />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#FF0000' }]} onPress={() => handleSocialLink('https://youtube.com')}>
                <Ionicons name="logo-youtube" size={20} color="#fff" />
             </TouchableOpacity>
        </View>
        <Text style={[styles.versionText, { color: theme.icon }]}>App Version 2.0.1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    marginBottom: 10,
  },
  drawerLogo: {
    width: 140,
    height: 45,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#005CB9',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  guestInfo: {
    gap: 5,
  },
  guestWelcome: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  guestSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 10,
  },
  loginBtnHeader: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  loginBtnText: {
    color: '#005CB9',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.7,
  },
  menuGroup: {
    borderRadius: 12,
    overflow: 'hidden',
    // Slight shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1877F2', // Default blue, overridden inline
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 10,
    opacity: 0.5,
  },
});
