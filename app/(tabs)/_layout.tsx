import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { CustomHeader } from '@/components/CustomHeader';
import { CategoryProvider } from '@/context/CategoryContext';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <CategoryProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: '#888',
          headerShown: true,
          header: () => <CustomHeader />,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopColor: 'rgba(0,0,0,0.1)',
            elevation: 4,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginBottom: 5,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'होम',
            tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />,
          }}
        />
        <Tabs.Screen
          name="videos"
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
                marginBottom: 30, // Raise the button
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
          options={{
            title: 'रील्स',
            tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "flash" : "flash-outline"} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: 'प्रोफाइल',
            tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? "person" : "person-outline"} color={color} />,
          }}
        />
      </Tabs>
    </CategoryProvider>
  );
}
