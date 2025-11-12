import React, {useEffect, memo} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {colors} from '../../constants';
import {scale} from '../../utils';

const DOT_ACTIVE_WIDTH = scale(16);
const DOT_INACTIVE_WIDTH = scale(6);

type AnimatedDotsCarouselProps = {
  activeIndex: number;
  dataLength?: number;
  containerStyle?: ViewStyle;
};

type DotProps = {
  dotIndex: number;
  currentIndex: SharedValue<number>;
};

const Dot = memo(({dotIndex, currentIndex}: DotProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(
      currentIndex.value === dotIndex ? DOT_ACTIVE_WIDTH : DOT_INACTIVE_WIDTH,
    ),
    backgroundColor:
      currentIndex.value === dotIndex ? colors.deepBlue : colors.blue,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
});

export const AnimatedDotsCarousel = ({
  activeIndex,
  dataLength = 0,
  containerStyle = {},
}: AnimatedDotsCarouselProps) => {
  const currentIndex = useSharedValue(activeIndex);

  useEffect(() => {
    currentIndex.value = activeIndex;
  }, [activeIndex, currentIndex]);

  if (dataLength < 2) {
    return null;
  }

  const data = Array.from({length: dataLength}, (_, i) => i);

  return (
    <View style={[styles.dotsContainer, containerStyle]}>
      {data.map(index => (
        <Dot key={index} dotIndex={index} currentIndex={currentIndex} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: scale(6),
    borderRadius: scale(5),
    marginHorizontal: scale(3),
  },
});
