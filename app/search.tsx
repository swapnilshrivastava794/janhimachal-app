import { searchNews } from '@/api/server';
import { NewsCard } from '@/components/NewsCard';
import { NewsSkeleton } from '@/components/NewsSkeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedQuery(query);
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [query]);

  // Search API Call
  useEffect(() => {
      if (debouncedQuery.trim().length > 2) {
          fetchSearchResults(debouncedQuery);
      } else {
          setResults([]);
      }
  }, [debouncedQuery]);

  const fetchSearchResults = async (searchText: string) => {
      setIsLoading(true);
      try {
          const res = await searchNews(searchText, { page: 1, limit: 10 });
          setResults(res.results || res || []);
      } catch (error) {
          console.log("Search error:", error);
      } finally {
          setIsLoading(false);
      }
  };

  const renderItem = ({ item }: { item: any }) => (
      <View style={{ marginBottom: 16 }}>
        <NewsCard
            title={item.post_title || item.title}
            image={item.image}
            category={item.category || "Search Result"}
            author={item.posted_by || item.author || "Unknown"}
            date={item.post_date || item.date}
            shareUrl={item.share_url}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })}
        />
      </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Search Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={[styles.searchBar, { 
              backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
              borderColor: colorScheme === 'dark' ? '#333' : '#E5E5EA',
          }]}>
              <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
              <TextInput 
                  placeholder="Search news, topics..." 
                  placeholderTextColor={theme.icon}
                  style={[styles.input, { color: theme.text }]}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  returnKeyType="search"
              />
              {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                      <Ionicons name="close-circle" size={18} color={theme.icon} />
                  </TouchableOpacity>
              )}
          </View>
      </View>

      {/* Results */}
      {isLoading ? (
          <View style={{ padding: 16 }}>
              {[1, 2, 3].map(i => <NewsSkeleton key={i} />)}
          </View>
      ) : results.length > 0 ? (
          <FlatList 
              data={results}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
          />
      ) : (debouncedQuery.length > 2) ? (
          <View style={styles.centered}>
              <Ionicons name="search-outline" size={48} color={theme.borderColor} style={{ marginBottom: 12 }} />
              <Text style={{ color: theme.icon }}>No results found for "{debouncedQuery}"</Text>
          </View>
      ) : (
          <View style={styles.centered}>
              <Ionicons name="newspaper-outline" size={64} color={theme.borderColor} style={{ marginBottom: 12, opacity: 0.5 }} />
              <Text style={{ color: theme.icon, textAlign: 'center', maxWidth: 250 }}>Type to search for the latest news and updates</Text>
          </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12, // Slight rounded rectangle is more modern than pill sometimes, user asked for premium. 
    // Pill (22) is fine too. Let's stick to Pill but with 46 height. 
    // Actually user says "premium", maybe 16 radius is safer.
    // Let's go with 24 (pill).
    // borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
