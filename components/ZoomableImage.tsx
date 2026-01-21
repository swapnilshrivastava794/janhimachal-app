import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
    uri?: any; // Accept local require() or remote uri string
    height?: number;
}

export const ZoomableImage = ({ uri, height: customHeight }: Props) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const finalHeight = customHeight || 300;

    // Optimized spring config for "Liquid" feel
    const springConfig = {
        damping: 20,
        stiffness: 150,
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = e.scale;
        })
        .onEnd(() => {
            scale.value = withSpring(1, springConfig);
        });

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (scale.value > 1.1) {
                translateX.value = e.translationX;
                translateY.value = e.translationY;
            }
        })
        .onEnd(() => {
            translateX.value = withSpring(0, springConfig);
            translateY.value = withSpring(0, springConfig);
        });

    const composed = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value / scale.value },
            { translateY: translateY.value / scale.value },
        ],
        zIndex: scale.value > 1.1 ? 100 : 1, // Bring to front when zooming
    }));

    return (
        <GestureHandlerRootView style={[styles.container, { height: finalHeight }]}>
            <GestureDetector gesture={composed}>
                <Animated.View style={[styles.imageContainer, { height: finalHeight }, animatedStyle]}>
                    <Animated.Image
                        source={typeof uri === 'string' ? { uri } : uri}
                        style={[styles.image, { height: finalHeight }]}
                        resizeMode="contain"
                    />
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        overflow: 'visible', // Allow zoom to go outside container during pinch
        backgroundColor: 'transparent',
    },
    imageContainer: {
        width: width,
    },
    image: {
        width: width,
    },
});
