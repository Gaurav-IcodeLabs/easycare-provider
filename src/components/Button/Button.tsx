/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import React, {useCallback} from 'react';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import {AppText} from '../AppText/AppText';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  // style?: ViewStyle;
  style?: StyleProp<ViewStyle>;
  animatedViewStyle?: ViewStyle;
  titleStyle?: TextStyle;
  disabled?: boolean;
  loader?: boolean;
  loaderColor?: string;
  rightIcon?: ImageSourcePropType;
  leftIcon?: ImageSourcePropType;
  iconStyle?: ImageStyle;
  useGradient?: boolean;
  gradientColors?: string[];
}

export const Button = React.memo((props: ButtonProps) => {
  const {t} = useTranslation();
  const {
    title,
    onPress,
    style = {},
    animatedViewStyle = {},
    titleStyle = {},
    disabled = false,
    loader = false,
    loaderColor = colors.white,
    rightIcon,
    leftIcon,
    iconStyle,
    useGradient = true,
    gradientColors = [colors.deepBlue, colors.blue],
  } = props || {};

  const loaderOpacity = useSharedValue(loader ? 1 : 0);
  const textOpacity = useSharedValue(loader ? 0 : 1);
  const scaleValue = useSharedValue(1);

  React.useEffect(() => {
    loaderOpacity.value = withTiming(loader ? 1 : 0, {duration: 300});
    textOpacity.value = withTiming(loader ? 0 : 1, {duration: 300});
  }, [loader, loaderOpacity, textOpacity]);

  // Cleanup animations on unmount
  React.useEffect(() => {
    return () => {
      cancelAnimation(loaderOpacity);
      cancelAnimation(textOpacity);
      cancelAnimation(scaleValue);
    };
  }, [loaderOpacity, textOpacity, scaleValue]);

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
    transform: [{scale: scaleValue.value}],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{scale: scaleValue.value}],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleValue.value}],
  }));

  const handlePressIn = useCallback(() => {
    scaleValue.value = withTiming(0.95, {duration: 100});
  }, [scaleValue]);

  const handlePressOut = useCallback(() => {
    scaleValue.value = withTiming(1, {duration: 100});
  }, [scaleValue]);

  const renderContent = () => (
    <>
      <Animated.View style={[styles.loaderContainer, loaderStyle]}>
        <ActivityIndicator color={loaderColor} />
      </Animated.View>
      <Animated.View style={[styles.row, contentStyle, animatedViewStyle]}>
        {leftIcon && <Image source={leftIcon} style={[iconStyle]} />}
        <AppText style={[styles.text, titleStyle]}>{t(title)}</AppText>
        {rightIcon && <Image source={rightIcon} style={[iconStyle]} />}
      </Animated.View>
    </>
  );

  const pressableProps = {
    disabled: disabled || loader,
    onPress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  };

  const containerStyle = [
    styles.container,
    style,
    {opacity: disabled ? 0.5 : 1},
  ];

  return (
    <Animated.View style={buttonStyle}>
      {useGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={containerStyle}>
          <Pressable {...pressableProps} style={styles.pressableContent}>
            {renderContent()}
          </Pressable>
        </LinearGradient>
      ) : (
        <Pressable {...pressableProps} style={containerStyle}>
          {renderContent()}
        </Pressable>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: scale(50),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.deepBlue,
    overflow: 'hidden',
  },
  pressableContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: scale(16),
    ...primaryFont('500'),
  },
  loaderContainer: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
  },
});
