import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { CustomHeader } from '@/components/CustomHeader';
import { CategoryProvider, useCategory } from '@/context/CategoryContext';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

import * as NavigationBar from 'expo-navigation-bar';

import { TabBarProvider, useTabBar } from '@/context/TabBarContext';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const AnimatedTabBar = (props: any) => {
  const { tabBarTranslateY } = useTabBar();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
    };
  });

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBehaviorAsync('overlay-swipe');
      NavigationBar.setVisibilityAsync('hidden');
    }
  }, []);

  return (
    <Animated.View style={[{ position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 8, zIndex: 100 }, animatedStyle]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

const TabsLayoutInner = () => {
  const colorScheme = useColorScheme();
  const { setSelectedSubcategoryId, setSelectedCategoryName } = useCategory(); // Get context methods

  // Function to reset category on tab press
  const handleTabPress = () => {
    // console.log("Tab pressed: Resetting category selection");
    setSelectedSubcategoryId(null);
    setSelectedCategoryName(null);
  };

  return (
    <Tabs
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#888',
        headerShown: true,
        header: () => <CustomHeader />,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: 'rgba(0,0,0,0.1)',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: handleTabPress,
        }}
        options={{
          title: 'होम',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="videos"
        listeners={{
          tabPress: handleTabPress,
        }}
        options={{
          title: 'वीडियो',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "play-circle" : "play-circle-outline"} color={color} />,
        }}
      />

      {/* --- Main Focused Tab: Nanhe Patrakar --- */}
      <Tabs.Screen
        name="nanhe-patrakar"
        options={{
          headerShown: false,
          title: 'नन्हे पत्रकार',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#a8272cff',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20, // Adjusted to match new tab bar height
              elevation: 10,
              shadowColor: '#E31E24',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              borderWidth: 4,
              borderColor: '#fff',
            }}>
              <Ionicons size={30} name="star" color="#fff" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="reels"
        listeners={{
          tabPress: handleTabPress,
        }}
        options={{
          title: 'रील्स',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "flash" : "flash-outline"} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: handleTabPress,
        }}
        options={{
          headerShown: false,
          title: 'प्रोफाइल',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "person" : "person-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default function TabLayout() {
  return (
    <CategoryProvider>
      <TabBarProvider>
        <TabsLayoutInner />
      </TabBarProvider>
    </CategoryProvider>
  );
}
