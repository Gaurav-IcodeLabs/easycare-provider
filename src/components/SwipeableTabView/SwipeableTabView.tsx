import React, {useRef} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type SwipeableTabViewProps = {
  children: React.ReactNode;
  currentIndex: number;
  totalTabs: number;
  onSwipe: (direction: 'left' | 'right') => void;
};

export const SwipeableTabView: React.FC<SwipeableTabViewProps> = ({
  children,
  currentIndex,
  totalTabs,
  onSwipe,
}) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate(event => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd(event => {
      const shouldSwipeLeft =
        event.translationX < -SWIPE_THRESHOLD && currentIndex < totalTabs - 1;
      const shouldSwipeRight =
        event.translationX > SWIPE_THRESHOLD && currentIndex > 0;

      if (shouldSwipeLeft) {
        runOnJS(onSwipe)('left');
      } else if (shouldSwipeRight) {
        runOnJS(onSwipe)('right');
      }

      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
