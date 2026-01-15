import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewToken
} from 'react-native';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44; // Safe fallback

// Same static data
const STORIES = [
  {
    id: '1',
    user: 'Jan Himachal',
    avatar: 'https://img.freepik.com/free-vector/breaking-news-concept_23-2148514216.jpg',
    items: [
      { id: 's1', type: 'image', url: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg', duration: 5000 },
      { id: 's2', type: 'image', url: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg', duration: 5000 },
    ]
  },
  {
    id: '2',
    user: 'UAE Updates',
    avatar: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg',
    items: [
       { id: 's3', type: 'image', url: 'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg', duration: 5000 },
    ]
  },
  {
    id: '3',
    user: 'Tech World',
    avatar: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    items: [
       { id: 's4', type: 'image', url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', duration: 5000 },
       { id: 's5', type: 'image', url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg', duration: 5000 },
    ]
  },
  {
    id: '4',
    user: 'Travel',
    avatar: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg',
    items: [
       { id: 's6', type: 'image', url: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg', duration: 5000 },
    ]
  },
  {
    id: '5',
    user: 'Lifestyle',
    avatar: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg',
    items: [
        { id: 's7', type: 'image', url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', duration: 5000 },
    ]
  }
];

// Individual Component for each User's Stories
const UserStoryPage = ({ user, isVisible, onFinish, onPrev, onClose }: any) => {
    const [storyIndex, setStoryIndex] = useState(0);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const progress = useRef(new Animated.Value(0)).current;
    
    // Reset state when user becomes visible or hidden
    useEffect(() => {
        if (!isVisible) {
            progress.setValue(0);
            return;
        }
        setStoryIndex(0); // Reset to first story when revisiting user? Or keep state? Insta keeps state usually. Let's start fresh for simplicity or keep it simple.
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;
        
        setIsImageLoading(true); // Assuming new image load
        progress.setValue(0);

        const currentDuration = user.items[storyIndex].duration;
        
        const anim = Animated.timing(progress, {
            toValue: 1,
            duration: currentDuration,
            useNativeDriver: false, // width property
        });

        // Delay start slightly to allow render?
        // Actually we should wait for image load, but for now just run it.
        setIsImageLoading(false); // Mock load complete
        anim.start(({ finished }) => {
            if (finished) {
                goNext();
            }
        });

        return () => anim.stop();
    }, [storyIndex, isVisible, user]);

    const goNext = () => {
        if (storyIndex < user.items.length - 1) {
            setStoryIndex(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    const goPrev = () => {
        if (storyIndex > 0) {
            setStoryIndex(prev => prev - 1);
        } else {
            onPrev();
        }
    };

    const handlePress = (evt: any) => {
        const x = evt.nativeEvent.locationX;
        if (x < width * 0.3) {
            goPrev();
        } else {
            goNext();
        }
    };

    // PanResponder for Swipe Down
    const pan = useRef(new Animated.ValueXY()).current;
    
    // Scale effect based on vertical drag
    const scale = pan.y.interpolate({
        inputRange: [0, height],
        outputRange: [1, 0.8],
        extrapolate: 'clamp',
    });

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
           // Only capture if moving down significantly more than horizontal
           return gestureState.dy > 10 && gestureState.dy > Math.abs(gestureState.dx);
        },
        onPanResponderMove: Animated.event(
          [null, { dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 100) {
            // Close
            onClose();
          } else {
            // Reset
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
          }
        },
      })
    ).current;

    const currentStory = user.items[storyIndex];

    return (
        <Animated.View 
            style={[
                styles.pageContainer, 
                { 
                    transform: [{ translateY: pan.y }, { scale }],
                    // Add some borderRadius when dragging
                    borderRadius: pan.y.interpolate({ inputRange: [0, 100], outputRange: [0, 20] })
                }
            ]}
            {...panResponder.panHandlers}
        >
             {/* Background Image */}
             <Image 
                source={{ uri: currentStory.url }} 
                style={styles.image} 
                resizeMode="cover"
            />

             {/* Dark overlay for text readability */}
             <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                 {/* Progress Bars */}
                 <View style={styles.progressBarWrapper}>
                     {user.items.map((item: any, index: number) => (
                         <View key={item.id} style={styles.progressBarBg}>
                             <Animated.View 
                                style={[
                                    styles.progressBarFill, 
                                    {
                                        width: index === storyIndex 
                                            ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                                            : index < storyIndex ? '100%' : '0%'
                                    }
                                ]}
                             />
                         </View>
                     ))}
                 </View>

                 {/* Header */}
                 <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <Text style={styles.userName}>{user.user}</Text>
                        <Text style={styles.timeText}>2h</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                 </View>

                 {/* Tappable Area */}
                 <TouchableWithoutFeedback onPress={handlePress}>
                     <View style={styles.touchableArea} />
                 </TouchableWithoutFeedback>

                 {/* Footer input */}
                 <View style={styles.footer}>
                     <View style={styles.inputBox}>
                         <Text style={{ color: '#fff', opacity: 0.7 }}>Send message</Text>
                     </View>
                     <Ionicons name="heart-outline" size={28} color="#fff" />
                     <Ionicons name="paper-plane-outline" size={28} color="#fff" />
                 </View>
            </SafeAreaView>
        </Animated.View>
    );
};

export default function StoryViewer() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialIndex = params.initialIndex ? parseInt(params.initialIndex as string) : 0;
  
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  // Viewability Config to track visible user
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
        setCurrentUserIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50
  }).current;

  const handleUserFinish = () => {
      if (currentUserIndex < STORIES.length - 1) {
          flatListRef.current?.scrollToIndex({ index: currentUserIndex + 1, animated: true });
      } else {
          router.back();
      }
  };

  const handleUserPrev = () => {
      if (currentUserIndex > 0) {
          flatListRef.current?.scrollToIndex({ index: currentUserIndex - 1, animated: true });
      } else {
          // Restart first user or close? Usually restarts.
          // We can't really "restart" the internal state of the child easily without forcing re-render.
          // For now, let's just stay on first user (child component handles internal restart).
      }
  };

  // Scroll to initial index on mount
  useEffect(() => {
      // Small timeout to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 100);
  }, []); // Run once

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, animation: 'fade' }} />
      <StatusBar hidden />
      
      <FlatList
        ref={flatListRef}
        data={STORIES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
            <View style={{ width, height }}>
                <UserStoryPage 
                    user={item} 
                    isVisible={index === currentUserIndex}
                    onFinish={handleUserFinish}
                    onPrev={handleUserPrev}
                    onClose={() => router.back()}
                />
            </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pageContainer: {
    width: width,
    height: height,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    // We need to ensure clicks work inside
  },
  progressBarWrapper: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    marginTop: STATUSBAR_HEIGHT + 10,
    zIndex: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 15,
    zIndex: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  touchableArea: {
    flex: 1,
    // Debug color
    // backgroundColor: 'rgba(255,0,0,0.1)', 
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 20 : 40,
    marginBottom: Platform.OS === 'android' ? 20 : 0, // Extra margin for gesture nav
    gap: 16,
  },
  inputBox: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
