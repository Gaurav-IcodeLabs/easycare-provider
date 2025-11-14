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
import {onboardingPreview1, onboardingPreview2} from '../../assets';
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

  const slideWidth = width - scale(30);

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
    [isArabic],
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
        // console.log('Index updated to:', currentIndexShared.value);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [currentIndex, currentIndexShared]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  // Separate animation for text using reduced width
  const textAnimatedStyle = useAnimatedStyle(() => {
    const textTranslateValue = isArabic
      ? slideWidth * currentIndexShared.value
      : -slideWidth * currentIndexShared.value;
    return {
      transform: [{translateX: textTranslateValue}],
    };
  });

  const isLast = currentIndex === OnBoardingData.length - 1;

  return (
    <GradientWrapper>
      <GestureDetector gesture={gesture}>
        <View style={styles.wrapper}>
          <View style={styles.imageContainer} pointerEvents="none">
            <Animated.View
              style={[styles.imageSlideWrapper, imageAnimatedStyle]}>
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
          <View
            style={[
              styles.bottomContainer,
              {marginBottom: Math.max(scale(10), bottom)},
            ]}
            pointerEvents="box-none">
            <View
              style={[
                styles.contentContainer,
                {paddingBottom: Math.max(scale(30), 0)},
              ]}
              pointerEvents="box-none">
              <Animated.View
                style={[styles.slideWrapper, textAnimatedStyle]}
                pointerEvents="none">
                {OnBoardingData.map(item => (
                  <View key={item.id} style={styles.bottomSection}>
                    <AppText style={styles.title}>{t(item.title)}</AppText>
                    <AppText style={styles.desc}>{t(item.desc)}</AppText>
                  </View>
                ))}
              </Animated.View>

              <AnimatedDotsCarousel
                activeIndex={currentIndex}
                dataLength={OnBoardingData.length}
              />

              <Button
                title={
                  isLast ? t('OnBoarding.getStarted') : t('OnBoarding.next')
                }
                style={styles.button}
                onPress={handleNext}
              />
              <View style={styles.dotSection}>
                <TouchableOpacity
                  hitSlop={hitSlope(15)}
                  activeOpacity={0.5}
                  style={styles.skipSection}
                  onPress={handleSkip}
                  disabled={isLast}>
                  <AppText style={styles.skipText}>
                    {t('OnBoarding.skip')}
                  </AppText>
                </TouchableOpacity>
                <LanguageChangeButton />
              </View>
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
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
  },
  skipHidden: {
    // opacity: 0,
  },
  skipText: {
    fontSize: scale(16),
    color: colors.textBlack,
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
  contentContainer: {
    backgroundColor: colors.white,
    marginHorizontal: scale(15),
    borderRadius: scale(30),
    overflow: 'hidden',
    minHeight: scale(250),
  },
  slideWrapper: {
    flexDirection: 'row',
    marginBottom: scale(25),
  },
  bottomSection: {
    width: width - scale(30),
    paddingHorizontal: scale(20),
  },
  title: {
    fontSize: scale(24),
    color: colors.textBlack,
    textAlign: 'center',
    marginTop: scale(30),
    marginBottom: scale(20),
    ...secondaryFont('500'),
  },
  desc: {
    fontSize: scale(14),
    color: colors.neutralDark,
    textAlign: 'center',
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
});
