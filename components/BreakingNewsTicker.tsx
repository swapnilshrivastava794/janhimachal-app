import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

import { getNews } from '@/api/server';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

// Initial placeholder, will be replaced by API data
const DEFAULT_NEWS = "Loading breaking news...";

export function BreakingNewsTicker() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const [breakingNewsItems, setBreakingNewsItems] = React.useState<any[]>([]);
  const [textWidth, setTextWidth] = React.useState(0);

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      // console.log('Fetching breaking news...');
      // headlines=1 matches query param logic 'headlines' == '1' from user request description 
      // but user *request* text said: "param me headlines true jayega"
      // Looking at the python code provided: if self.request.GET.get('headlines') == '1':
      // So I should send '1' or true if axios serializes it correctly? 
      // Safe bet: headlines: '1' or usually boolean true in axios params becomes 'true'.
      // The user python code checks `== '1'`, so I will send '1'.
      
      const res = await getNews({ headlines: '1', limit: 5 });
      // console.log('Breaking news response:', JSON.stringify(res, null, 2));
      
      const newsItems = res.results || res || [];
      // console.log('News items found:', newsItems.length);
      
       if (Array.isArray(newsItems) && newsItems.length > 0) {
          setBreakingNewsItems(newsItems);
       } else {
          setBreakingNewsItems([{ id: 'default', post_title: DEFAULT_NEWS }]);
       }
     } catch (e) {
      //  console.log("Error fetching breaking news:", e);
       setBreakingNewsItems([{ id: 'default', post_title: "Error loading news" }]);
     }
   };

  useEffect(() => {
    if (textWidth > 0 && breakingNewsItems.length > 0) {
      // Calculate duration
      const screenWidth = Dimensions.get('window').width;
      const totalDistance = screenWidth + textWidth; 
      const speed = 50; 
      const duration = (totalDistance / speed) * 1000;

      translateX.setValue(screenWidth);

      const animation = Animated.loop(
        Animated.timing(translateX, {
          toValue: -textWidth, 
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [translateX, breakingNewsItems, textWidth]);

  return (
    <View style={[styles.container, { backgroundColor: theme.subcategoryBg }]}>
      <View style={[styles.labelContainer, { backgroundColor: theme.accent }]}>
        <Text style={[styles.labelText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>BREAKING</Text>
      </View>
      <View style={styles.tickerContainer}>
        <View 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}
        >
          <Animated.View 
            style={[
              { flexDirection: 'row', alignItems: 'center', transform: [{ translateX }] }
            ]}
            onLayout={(e) => {
                const width = e.nativeEvent.layout.width;
                if (width > 0 && Math.abs(width - textWidth) > 10) {
                   setTextWidth(width);
                }
            }}
          >
             {breakingNewsItems.map((item, index) => (
                 <TouchableOpacity 
                    key={index} 
                    onPressIn={() => {
                        // console.log("Ticker Clicked (In):", item.id);
                        if (item.id && item.id !== 'default') {
                            router.push({ pathname: '/post/[id]', params: { id: item.id } });
                        }
                    }}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }} 
                 >
                     <Text style={[styles.text, { color: theme.subcategoryText }]}>
                         {item.post_title || item.title}
                     </Text>
                     {/* Separator if not last */}
                     {index < breakingNewsItems.length - 1 && (
                         <Text style={[styles.text, { color: theme.subcategoryText, marginHorizontal: 8 }]}> • </Text>
                     )}
                 </TouchableOpacity>
             ))}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36, // Slight increase to fit touch area better
    overflow: 'hidden',
  },
  labelContainer: {
    paddingHorizontal: 8,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  labelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tickerContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
