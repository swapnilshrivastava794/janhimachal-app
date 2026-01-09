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

  return (
    <View style={styles.container}>
      <View style={[styles.titleContainer, { borderLeftColor: theme.primary }]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
          <Ionicons name="chevron-forward" size={14} color={theme.primary} />
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
    gap: 8, // Space between title and button
  },
  titleContainer: {
    borderLeftWidth: 4,
    paddingLeft: 8,
  },
  title: {
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    lineHeight: 22,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end', // Move to right
    marginTop: 4,
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
