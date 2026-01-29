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
  const isDark = colorScheme === 'dark';

  const {
    selectedCategoryName,
    setSelectedCategoryName,
    selectedSubcategoryId,
    setSelectedSubcategoryId,
    categories,
    setCategories
  } = useCategory();

  const categoryScrollRef = React.useRef<ScrollView>(null);
  const subCategoryScrollRef = React.useRef<ScrollView>(null);

  const displayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric'
  }).toUpperCase();

  // Auto-scroll logic 
  React.useEffect(() => {
    if (subCategoryScrollRef.current && selectedSubcategoryId && categories.length > 0) {
      const activeSubcats = categories.find(c => c.cat_name === selectedCategoryName)?.sub_categories || [];
      const index = activeSubcats.findIndex((s: any) => s.id === selectedSubcategoryId);
      if (index !== -1) {
        subCategoryScrollRef.current.scrollTo({ x: index * 80, animated: true });
      }
    }
  }, [selectedSubcategoryId]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const data = res.data;
      setCategories(data);
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  };

  const handleCategoryPress = (cat: any) => {
    if (selectedCategoryName === cat.cat_name) {
      setSelectedCategoryName(null as any);
      setSelectedSubcategoryId(null as any);
    } else {
      setSelectedCategoryName(cat.cat_name);
      const firstSub = (cat.sub_categories && cat.sub_categories.length > 0) ? cat.sub_categories[0] : null;
      if (firstSub) {
        setSelectedSubcategoryId(firstSub.id);
        if (pathname !== '/videos' && pathname !== '/reels') {
          router.push({
            pathname: '/post' as any,
            params: { title: firstSub.subcat_name, subcategory_id: firstSub.id, type: 'category_feed' }
          });
        }
      } else {
        if (pathname !== '/videos' && pathname !== '/reels') {
          router.push({
            pathname: '/post' as any,
            params: { title: cat.cat_name, type: 'category_feed' }
          });
        }
      }
    }
  };

  const handleSubcategoryPress = (subId: number, subName: string) => {
    setSelectedSubcategoryId(subId);
    if (pathname !== '/videos' && pathname !== '/reels') {
      router.push({
        pathname: '/post' as any,
        params: { title: subName, subcategory_id: subId, type: 'category_feed' }
      });
    }
  };

  const activeSubcategories = categories.find(c => c.cat_name === selectedCategoryName)?.sub_categories || [];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <SafeAreaView>
        {/* Top Navbar - Sharp & Bold */}
        <View style={[styles.topBar, { borderBottomColor: isDark ? '#1a1a1a' : '#f0f0f0' }]}>
          {/* Left: Highlighted Date */}
          <View style={styles.sideBlock}>
            <Text style={[styles.topDateText, { color: isDark ? '#fff' : '#111' }]}>{displayDate}</Text>
            <WeatherWidget />
          </View>

          {/* Center: Hero Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Right: Sharp Icons */}
          <View style={[styles.sideBlock, { alignItems: 'flex-end' }]}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search')}>
              <Ionicons name="search" size={24} color={isDark ? '#fff' : '#111'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Navigation - Solid Line Design */}
        <View style={[styles.navSection, { borderBottomColor: isDark ? '#1a1a1a' : '#eeeeee' }]}>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((cat, index) => {
              const isActive = selectedCategoryName === cat.cat_name;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => handleCategoryPress(cat)}
                  style={styles.categoryItem}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: isActive ? (isDark ? '#fff' : '#000') : (isDark ? '#999' : '#000') }, // Maximum darkness for inactive text
                    isActive && { fontWeight: '900' }
                  ]}>
                    {cat.cat_name.toUpperCase()}
                  </Text>
                  {isActive && <View style={[styles.activeBar, { backgroundColor: isDark ? '#fff' : '#000' }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Subcategories - Crisp & Dark Text */}
        {activeSubcategories.length > 0 && (
          <View style={styles.subnavSection}>
            <ScrollView
              ref={subCategoryScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcategoryScrollContent}
            >
              {activeSubcategories.map((sub: any, index: number) => {
                const isSubActive = selectedSubcategoryId === sub.id;
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => handleSubcategoryPress(sub.id, sub.subcat_name)}
                    style={styles.subcategoryItem}
                  >
                    <Text style={[
                      styles.subcategoryText,
                      { color: isSubActive ? (isDark ? '#fff' : '#000') : (isDark ? '#111' : '#222') }, // Darker subcategories
                      isSubActive && { fontWeight: '900' }
                    ]}>
                      {sub.subcat_name.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Ticker at the bottom with a solid divider */}
        <View style={[styles.tickerWrapper, { borderTopColor: isDark ? '#222' : '#ddd' }]}>
          <BreakingNewsTicker />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 65,
    borderBottomWidth: 2, // Even bolder divider
  },
  sideBlock: {
    width: 90, // Slightly wider for bold date
  },
  topDateText: {
    fontSize: 13, // Larger date
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 145,
    height: 45,
  },
  navSection: {
    paddingTop: 8,
    borderBottomWidth: 1.5,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 22,
    height: 42,
  },
  categoryItem: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  activeBar: {
    position: 'absolute',
    bottom: 0,
    width: '110%', // Sligthly wider than text for a bold look
    height: 3.5,
    borderRadius: 0, // Sharp square ends
  },
  subnavSection: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  subcategoryScrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  subcategoryItem: {
    justifyContent: 'center',
  },
  subcategoryText: {
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
  tickerWrapper: {
    borderTopWidth: 1.5,
  }
});
