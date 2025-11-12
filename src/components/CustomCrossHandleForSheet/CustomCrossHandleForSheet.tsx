import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  useBottomSheetInternal,
  useBottomSheetGestureHandlers,
} from '@gorhom/bottom-sheet';
import {cross} from '../../assets';
import {commonShadow, scale} from '../../utils';
import {GradientWrapper} from '../GradientWrapper/GradientWrapper';
import {colors} from '../../constants';

interface Props {
  onClose?: () => void;
}

export const CustomCrossHandleForSheet: React.FC<Props> = ({onClose}) => {
  const {animatedIndex} = useBottomSheetInternal();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [-1, 0, 1], [0, 0.5, 1]);
    const translateY = interpolate(
      animatedIndex.value,
      [-1, 0, 1],
      [10, 10, 0],
    );
    return {
      opacity,
      transform: [{translateY}],
    };
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Pressable onPress={onClose} hitSlop={10}>
        <GradientWrapper style={styles.container}>
          <Image source={cross} style={styles.image} tintColor={colors.white} />
        </GradientWrapper>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: -scale(50),
    alignSelf: 'center',
  },
  container: {
    height: scale(40),
    width: scale(40),
    borderRadius: scale(100),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...commonShadow,
  },
  image: {
    height: scale(20),
    width: scale(20),
  },
});
