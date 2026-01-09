import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function WeatherWidget() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const hour = new Date().getHours();
  // Assume day is 6 AM to 6 PM
  const isDaytime = hour >= 6 && hour < 18;

  return (
    <View style={styles.container}>
      <Ionicons 
        name={isDaytime ? "sunny" : "moon"} 
        size={16} 
        color={isDaytime ? "#FDB813" : theme.text} 
      />
      <Text style={[styles.text, { color: theme.text }]}>Jan Himachal</Text>
      {/* <Text style={[styles.text, { color: theme.text }]}>Jan Himachal {isDaytime ? '32' : '28'}°C</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 2,
    marginRight: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
