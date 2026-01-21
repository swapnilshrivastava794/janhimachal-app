import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getCategories } from '@/api/server';
import { useCategory } from '@/context/CategoryContext';

import { BreakingNewsTicker } from '@/components/BreakingNewsTicker';
import { WeatherWidget } from '@/components/WeatherWidget';

export function CustomHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { selectedCategoryName, setSelectedCategoryName, selectedSubcategoryId, setSelectedSubcategoryId, categories, setCategories } = useCategory();
  const categoryScrollRef = React.useRef<ScrollView>(null);
  const subCategoryScrollRef = React.useRef<ScrollView>(null);

  // Auto-scroll effect for Categories/Subcategories
  React.useEffect(() => {
    // Scroll subcategory into view
    if (subCategoryScrollRef.current && selectedSubcategoryId && categories.length > 0) {
      const activeSubcats = categories.find(c => c.cat_name === selectedCategoryName)?.sub_categories || [];
      const index = activeSubcats.findIndex((s: any) => s.id === selectedSubcategoryId);
      if (index !== -1) {
        subCategoryScrollRef.current.scrollTo({ x: index * 80, animated: true });
      }
    }
  }, [selectedSubcategoryId]);

  React.useEffect(() => {
    // Scroll main category into view
    if (categoryScrollRef.current && selectedCategoryName && categories.length > 0) {
      const index = categories.findIndex(c => c.cat_name === selectedCategoryName);
      if (index !== -1) {
        categoryScrollRef.current.scrollTo({ x: index * 90, animated: true });
      }
    }
  }, [selectedCategoryName]);


  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const data = res.data;
      setCategories(data);

      // Auto-select first category on startup so subcategories are always visible
      if (data && data.length > 0 && !selectedCategoryName) {
        setSelectedCategoryName(data[0].cat_name);
      }
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  };

  const handleCategoryPress = (cat: any) => {
    // 1. Toggle the selected category in context so subcategories show in header
    if (selectedCategoryName === cat.cat_name) {
      setSelectedCategoryName(null as any);
      setSelectedSubcategoryId(null as any);
    } else {
      setSelectedCategoryName(cat.cat_name);
      // 2. Auto-select first subcategory and NAVIGATE immediately (Zero-click data update)
      const firstSub = (cat.sub_categories && cat.sub_categories.length > 0) ? cat.sub_categories[0] : null;
      if (firstSub) {
        setSelectedSubcategoryId(firstSub.id);
        // Only navigate to /post if NOT already on videos or reels tab
        if (pathname !== '/videos' && pathname !== '/reels') {
          router.push({
            pathname: '/post' as any,
            params: {
              title: firstSub.subcat_name,
              subcategory_id: firstSub.id,
              type: 'category_feed'
            }
          });
        }
      } else {
        // Fallback for categories without subcategories
        if (pathname !== '/videos' && pathname !== '/reels') {
          router.push({
            pathname: '/post' as any,
            params: {
              title: cat.cat_name,
              type: 'category_feed'
            }
          });
        }
      }
    }
  };

  const handleSubcategoryPress = (subId: number, subName: string) => {
    setSelectedSubcategoryId(subId);

    // Only navigate to /post if NOT already on videos or reels tab
    if (pathname !== '/videos' && pathname !== '/reels') {
      router.push({
        pathname: '/post' as any,
        params: {
          title: subName,
          subcategory_id: subId,
          type: 'category_feed'
        }
      });
    }
  };

  const activeSubcategories = categories.find(c => c.cat_name === selectedCategoryName)?.sub_categories || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderColor }]}>
      <SafeAreaView>
        <View style={styles.topBar}>
          <View style={[styles.leftRow, { flex: 1 }]}>
            <WeatherWidget />
          </View>

          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.rightRow, { flex: 1, justifyContent: 'flex-end' }]}>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Ionicons name="search" size={24} color={theme.text} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Tabs */}
        <View>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.categoriesContainer, { backgroundColor: theme.categoryBg }]}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategoryName === cat.cat_name && {
                    backgroundColor: theme.primary, // Using primary color for active
                    borderRadius: 25,
                    elevation: 5,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    paddingHorizontal: 16
                  }
                ]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  {
                    color: selectedCategoryName === cat.cat_name ? '#fff' : theme.categoryText,
                    fontWeight: selectedCategoryName === cat.cat_name ? '900' : 'bold'
                  }
                ]}>
                  {selectedCategoryName === cat.cat_name && <Ionicons name="checkmark-circle" size={12} color="#fff" />} {cat.cat_name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Subcategories */}
          {activeSubcategories.length > 0 && (
            <ScrollView
              ref={subCategoryScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.subcategoriesContainer, { backgroundColor: theme.subcategoryBg }]}
              contentContainerStyle={styles.subcategoriesContent}
            >
              {activeSubcategories.map((sub: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryItem,
                    selectedSubcategoryId === sub.id && {
                      borderBottomWidth: 3,
                      borderBottomColor: theme.primary
                    }
                  ]}
                  onPress={() => handleSubcategoryPress(sub.id, sub.subcat_name)}
                >
                  <Text style={[
                    styles.subcategoryText,
                    {
                      color: selectedSubcategoryId === sub.id ? theme.primary : theme.subcategoryText,
                      fontWeight: selectedSubcategoryId === sub.id ? '900' : '600',
                      fontSize: selectedSubcategoryId === sub.id ? 12 : 11
                    }
                  ]}>
                    {selectedSubcategoryId === sub.id && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, marginRight: 4 }} />}
                    {sub.subcat_name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Breaking News Ticker */}
          <BreakingNewsTicker />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    paddingBottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 60,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 40,
  },
  icon: {
    opacity: 0.8,
  },
  categoriesContainer: {
    maxHeight: 40,
  },
  categoriesContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subcategoriesContainer: {
    maxHeight: 36,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  subcategoriesContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  subcategoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 2,
  },
  subcategoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
