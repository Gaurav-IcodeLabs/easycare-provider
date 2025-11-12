import React, {JSX} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Image,
  ImageProps,
  DimensionValue,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useImageAspectHeight} from '../../hooks';
import {colors} from '../../constants';
import {AppImageProps, CmsAspectRatios} from '../../apptypes';

const calculateHeight = (
  aspectRatio: string,
  originalHeight: number,
  screenWidth: number,
): number | undefined => {
  switch (aspectRatio) {
    case CmsAspectRatios.SQUARE:
      return screenWidth;
    case CmsAspectRatios.LANDSCAPE:
      return (screenWidth * 9) / 16;
    case CmsAspectRatios.PORTRAIT:
      return (screenWidth * 3) / 2;
    case CmsAspectRatios.LISTINGPORTRAIT:
      return (screenWidth * 4) / 3;
    case CmsAspectRatios.LISTINGLANDSCAPE:
      return (screenWidth * 3) / 4;
    case CmsAspectRatios.ORIGINAL:
    default:
      return originalHeight;
  }
};

export const AppImage = ({
  source,
  height,
  width,
  loaderColor = colors.black,
  style,
  onError,
  showLoading = true,
  aspectRatio = CmsAspectRatios.SQUARE,
  ...props
}: AppImageProps): JSX.Element => {
  const loading = useSharedValue(1);
  const error = useSharedValue(0);

  const originalHeight = useImageAspectHeight(source?.uri, width);
  const imageHeight = calculateHeight(
    aspectRatio,
    originalHeight ?? width,
    width,
  );

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: withTiming(loading.value * (1 - error.value), {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  const imageStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1 - loading.value, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  const errorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(error.value, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  const handleLoad = (): void => {
    loading.value = 0;
  };

  const handleError = (): void => {
    loading.value = 0;
    error.value = 1;
    onError?.();
  };

  const sizeStyle = {
    width: (width ?? '100%') as DimensionValue,
    height: (aspectRatio ? imageHeight : height ?? '100%') as DimensionValue,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.loader, loaderStyle]}>
        {showLoading && <ActivityIndicator color={loaderColor} />}
      </Animated.View>

      <Animated.View style={[styles.errorContainer, errorStyle]}>
        <View style={[sizeStyle, {backgroundColor: colors.lightGrey}]} />
      </Animated.View>

      <Animated.View style={[imageStyle, StyleSheet.absoluteFill]}>
        <Image
          source={source}
          style={[sizeStyle]}
          onLoad={showLoading ? handleLoad : undefined}
          onError={handleError}
          {...props}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
