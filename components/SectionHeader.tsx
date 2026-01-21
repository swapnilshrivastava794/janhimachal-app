import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

export function SectionHeader({ title, onViewAll }: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={[styles.titleContainer, { borderLeftColor: theme.primary, flex: 1 }]}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
      </View>
      {onViewAll && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onViewAll}
          style={[styles.viewAllIconBtn, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}
        >
          <Ionicons name="arrow-forward" size={16} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    borderLeftWidth: 4,
    paddingLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  viewAllIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
