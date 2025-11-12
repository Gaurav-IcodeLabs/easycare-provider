import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {bottomInset, hitSlope, scale, width} from '../../utils';
import {useTranslation} from 'react-i18next';
import {colors, primaryFont, AUTH, secondaryFont} from '../../constants';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {OnBoardingScreenProps} from '../../apptypes';

import {
  AnimatedDotsCarousel,
  AppText,
  Button,
  GradientWrapper,
  LanguageChangeButton,
} from '../../components';

import {useLanguage} from '../../hooks';
import {curveBg, onboardingPreview1, onboardingPreview2} from '../../assets';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDispatch} from '../../sharetribeSetup';
import {updateAppState} from '../../slices/app.slice';

const OnBoardingData = [
  {
    id: '1',
    title: 'OnBoarding.titleOne',
    desc: 'OnBoarding.descOne',
    image: onboardingPreview1,
  },
  {
    id: '2',
    title: 'OnBoarding.titleTwo',
    desc: 'OnBoarding.descTwo',
    image: onboardingPreview2,
  },
  {
    id: '3',
    title: 'OnBoarding.titleThree',
    desc: 'OnBoarding.descThree',
    image: onboardingPreview1,
  },
];

export const Onboarding: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<OnBoardingScreenProps['navigation']>();
  const {isArabic} = useLanguage();
  const {bottom} = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const currentIndexShared = useSharedValue(0);
  const dispatch = useAppDispatch();

  // Sync shared value with state
  useAnimatedReaction(
    () => currentIndexShared.value,
    (value, previous) => {
      if (value !== previous) {
        const translateValue = isArabic ? width * value : -width * value;
        translateX.value = withSpring(translateValue, {
          damping: 25,
          stiffness: 120,
          overshootClamping: true,
        });
      }
    },
  );

  // Reset animation when language changes
  useEffect(() => {
    const translateValue = isArabic
      ? width * currentIndex
      : -width * currentIndex;
    translateX.value = withSpring(translateValue, {
      damping: 25,
      stiffness: 120,
      overshootClamping: true,
    });
  }, [currentIndex, isArabic, translateX]);

  const handleNext = () => {
    if (currentIndex < OnBoardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      currentIndexShared.value = nextIndex;
    } else {
      dispatch(updateAppState({key: 'skipOnboarding', value: true}));
      navigation.navigate(AUTH.LOGIN);
    }
  };

  const handleSkip = () => {
    dispatch(updateAppState({key: 'skipOnboarding', value: true}));
    navigation.navigate(AUTH.LOGIN);
  };

  const gesture = Gesture.Pan().onEnd(event => {
    'worklet';
    const swipeThreshold = 50;
    const currentIdx = currentIndexShared.value;
    const swipeLeft = isArabic
      ? event.velocityX > swipeThreshold
      : event.velocityX < -swipeThreshold;
    const swipeRight = isArabic
      ? event.velocityX < -swipeThreshold
      : event.velocityX > swipeThreshold;

    if (swipeLeft && currentIdx < OnBoardingData.length - 1) {
      const next = currentIdx + 1;
      currentIndexShared.value = next;
    } else if (swipeRight && currentIdx > 0) {
      const prev = currentIdx - 1;
      currentIndexShared.value = prev;
    } else {
      // Snap back to current page if swipe not strong enough
      const translateValue = isArabic
        ? width * currentIdx
        : -width * currentIdx;
      translateX.value = withSpring(translateValue, {
        damping: 25,
        stiffness: 120,
        overshootClamping: true,
      });
    }
  });

  // Sync shared value back to state for UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndexShared.value !== currentIndex) {
        setCurrentIndex(currentIndexShared.value);
        console.log('Index updated to:', currentIndexShared.value);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [currentIndex, currentIndexShared]);

  // Debug logging
  useEffect(() => {
    console.log(
      'Current index:',
      currentIndex,
      'TranslateX:',
      translateX.value,
    );
  }, [currentIndex, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const isLast = currentIndex === OnBoardingData.length - 1;

  return (
    <GradientWrapper>
      <GestureDetector gesture={gesture}>
        <View style={styles.wrapper}>
          <TouchableOpacity
            hitSlop={hitSlope(15)}
            activeOpacity={0.5}
            style={[styles.skipSection, isLast && styles.skipHidden]}
            onPress={handleSkip}
            disabled={isLast}>
            <AppText style={styles.skipText}>{t('OnBoarding.skip')}</AppText>
          </TouchableOpacity>
          <View style={styles.imageContainer} pointerEvents="none">
            <Animated.View style={[styles.imageSlideWrapper, animatedStyle]}>
              {OnBoardingData.map(item => (
                <Image
                  key={`img-${item.id}`}
                  source={item.image}
                  style={styles.backgroundImage}
                  resizeMode="contain"
                />
              ))}
            </Animated.View>
          </View>
          <View style={styles.bottomContainer} pointerEvents="box-none">
            <View pointerEvents="none">
              <Image
                source={curveBg}
                style={styles.curveBg}
                resizeMode="cover"
              />
            </View>
            <View
              style={[
                styles.contentContainer,
                {paddingBottom: Math.max(scale(10), bottom)},
              ]}
              pointerEvents="box-none">
              <Animated.View
                style={[styles.slideWrapper, animatedStyle]}
                pointerEvents="none">
                {OnBoardingData.map(item => (
                  <View key={item.id} style={styles.bottomSection}>
                    <AppText style={styles.title}>{t(item.title)}</AppText>
                    <AppText style={styles.desc}>{t(item.desc)}</AppText>
                  </View>
                ))}
              </Animated.View>
              <View style={styles.dotSection}>
                <AnimatedDotsCarousel
                  activeIndex={currentIndex}
                  dataLength={OnBoardingData.length}
                />
                <LanguageChangeButton />
              </View>
              <Button
                title={
                  isLast ? t('OnBoarding.getStarted') : t('OnBoarding.next')
                }
                style={styles.button}
                onPress={handleNext}
              />
            </View>
          </View>
        </View>
      </GestureDetector>
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: bottomInset,
  },
  skipSection: {
    position: 'absolute',
    right: 0,
    zIndex: 100,
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
  },
  skipHidden: {
    opacity: 0,
  },
  skipText: {
    fontSize: scale(18),
    color: colors.white,
    ...primaryFont('400'),
  },
  imageContainer: {
    position: 'absolute',
    top: -scale(40),
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  imageSlideWrapper: {
    flexDirection: 'row',
    width: width * OnBoardingData.length,
    height: '80%',
  },
  backgroundImage: {
    width: width,
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  slideWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    width: width * OnBoardingData.length,
  },
  bottomSection: {
    width: width,
    paddingHorizontal: scale(20),
  },
  title: {
    fontSize: scale(32),
    color: colors.textBlack,
    textAlign: 'auto',
    marginTop: scale(30),
    marginBottom: scale(20),
    ...secondaryFont('500'),
  },
  desc: {
    fontSize: scale(16),
    color: colors.neutralDark,
    textAlign: 'auto',
    ...primaryFont('400'),
  },
  button: {
    marginTop: scale(40),
    marginHorizontal: scale(20),
  },
  dotSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scale(16),
    paddingHorizontal: scale(20),
  },
  curveBg: {
    width: width,
    height: scale(69),
    zIndex: 1,
  },
  contentContainer: {
    backgroundColor: colors.white,
  },
});
