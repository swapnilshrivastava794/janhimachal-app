import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getCategories } from '@/api/server';
import { useCategory } from '@/context/CategoryContext';

import { BreakingNewsTicker } from '@/components/BreakingNewsTicker';
import { WeatherWidget } from '@/components/WeatherWidget';

// ... (Imports and CATEGORY_DATA remain same)

export function CustomHeader() {
  const router = useRouter();
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
          // Estimate position (assuming ~100px width per item)
          // For more precision, we'd use onLayout, but this is a rough "scroll to make visible"
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
      if (data.length > 0 && !selectedCategoryName) {
         // User Default: "UAE News" -> "Know UAE"
         const defaultCat = data.find((c: any) => c.cat_name === "UAE News") || data[0];
         setSelectedCategoryName(defaultCat.cat_name);
         
         // Find "Know UAE" in subcategories
         if (defaultCat.sub_categories && defaultCat.sub_categories.length > 0) {
             const defaultSub = defaultCat.sub_categories.find((s: any) => s.subcat_name === "Know UAE") || defaultCat.sub_categories[0];
             setSelectedSubcategoryId(defaultSub.id);
         }
      }
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  };

  const handleCategoryPress = (cat: any) => {
    setSelectedCategoryName(cat.cat_name);
    // Automatically select first subcategory or clear selection?
    // User logic: "subcategory_id header select hogi"
    // Usually selecting a main category might select "All" or first subcat.
    // For now, if subcategories exist, maybe default to first one?
    // The previous logic didn't enforce a subcat selection on category press.
    // But since HomeScreen depends on subcategory_id, we should update it.
    if (cat.sub_categories && cat.sub_categories.length > 0) {
        setSelectedSubcategoryId(cat.sub_categories[0].id);
    } else {
        setSelectedSubcategoryId(null as any); // Or 0
    }
  };

  const handleSubcategoryPress = (subId: number) => {
      setSelectedSubcategoryId(subId);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

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
                style={[styles.categoryItem, selectedCategoryName === cat.cat_name && { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={[styles.categoryText, { color: theme.categoryText }]}>{cat.cat_name.toUpperCase()}</Text>
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
                            borderBottomWidth: 2, 
                            borderBottomColor: theme.text 
                        }
                    ]}
                    onPress={() => handleSubcategoryPress(sub.id)}
                >
                  <Text style={[styles.subcategoryText, { color: theme.subcategoryText }]}>{sub.subcat_name.toUpperCase()}</Text>
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
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 200,
    height: 40,
  },
  icon: {
    opacity: 0.8,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  portalButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  portalButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  },
});
