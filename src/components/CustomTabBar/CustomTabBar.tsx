import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useState} from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import {commonShadow, scale} from '../../utils';
import {
  listingsActive,
  listingsInactive,
  ordersActive,
  ordersInactive,
  profileActive,
  profileInactive,
} from '../../assets';
import {colors, primaryFont, SCREENS} from '../../constants';
import {TFunction} from 'i18next';
import {ListingTypes} from '../../apptypes/interfaces/listing';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {AppText} from '../AppText/AppText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BlurView} from '@react-native-community/blur';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {AddOptionsModal} from '../AddOptionsModal';

type TranslationTS = TFunction<'translation', undefined>;

type AnimatedTabItemProps = {
  route: any;
  index: number;
  isFocused: boolean;
  tabIcon: number;
  tabTitle: string;
  onPress: (route: any, index: number) => void;
  t: TranslationTS;
};

const AnimatedTabItem = React.memo(
  ({
    route,
    index,
    isFocused,
    tabIcon,
    tabTitle,
    onPress,
    t,
  }: AnimatedTabItemProps) => {
    const backgroundOpacity = useSharedValue(isFocused ? 1 : 0);
    const textTranslateX = useSharedValue(isFocused ? 0 : -20);
    const textOpacity = useSharedValue(isFocused ? 1 : 0);

    React.useEffect(() => {
      if (isFocused) {
        backgroundOpacity.value = withTiming(1, {
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        textTranslateX.value = withTiming(0, {
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        textOpacity.value = withTiming(1, {
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else {
        backgroundOpacity.value = withTiming(0, {
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        textTranslateX.value = withTiming(-20, {
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        textOpacity.value = withTiming(0, {
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    }, [isFocused, backgroundOpacity, textTranslateX, textOpacity]);

    const backgroundStyle = useAnimatedStyle(() => ({
      opacity: backgroundOpacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
      transform: [{translateX: textTranslateX.value}],
      opacity: textOpacity.value,
    }));

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(route, index)}
        style={styles.tab}>
        <View style={styles.tabContent}>
          <Animated.View style={[styles.background, backgroundStyle]} />
          <View style={styles.iconTextContainer}>
            <Image
              tintColor={isFocused ? colors.blue : colors.white}
              source={tabIcon}
              style={styles.tabIcon}
            />
            {isFocused && (
              <Animated.View style={textStyle}>
                <AppText style={styles.label}>{t(tabTitle)}</AppText>
              </Animated.View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const {t} = useTranslation();
  const {bottom} = useSafeAreaInsets();
  const [showPopover, setShowPopover] = useState(false);

  const onPress = useCallback(
    (route: any, index: number) => {
      if (state.index !== index) {
        navigation.navigate(route.name);
      }
    },
    [state.index, navigation],
  );

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const currentIndex = state.index;
      const newIndex =
        direction === 'left' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex >= 0 && newIndex < state.routes.length) {
        navigation.navigate(state.routes[newIndex].name);
      }
    },
    [state.index, state.routes, navigation],
  );

  const hasSwipedLeft = useSharedValue(false);
  const hasSwipedRight = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      hasSwipedLeft.value = false;
      hasSwipedRight.value = false;
    })
    .onUpdate(event => {
      const SWIPE_THRESHOLD = 50;
      if (event.translationX < -SWIPE_THRESHOLD && !hasSwipedLeft.value) {
        hasSwipedLeft.value = true;
        runOnJS(handleSwipe)('left');
      } else if (
        event.translationX > SWIPE_THRESHOLD &&
        !hasSwipedRight.value
      ) {
        hasSwipedRight.value = true;
        runOnJS(handleSwipe)('right');
      }
    });

  const getTabIcon = useCallback((route: string, isFocused: boolean) => {
    switch (route) {
      case 'Home':
        return isFocused ? listingsActive : listingsInactive;
      case 'MyOrders':
        return isFocused ? ordersActive : ordersInactive;
      case 'Profile':
        return isFocused ? profileActive : profileInactive;
      default:
        return null;
    }
  }, []);

  const getTabTitle = useCallback((route: string) => {
    switch (route) {
      case 'Home':
        return 'Navigation.home';
      case 'MyOrders':
        return 'Navigation.myOrders';
      case 'Profile':
        return 'Navigation.profile';
      default:
        return 'Navigation.home';
    }
  }, []);

  const handlePlusPress = useCallback(() => {
    setShowPopover(true);
  }, []);

  const handleSelectOption = (
    option: ListingTypes.SERVICE | ListingTypes.PRODUCT,
  ) => {
    if (option === ListingTypes.SERVICE) {
      navigation.navigate(SCREENS.CREATE_SERVICE);
    } else {
      navigation.navigate(SCREENS.CREATE_PRODUCT, {
        listingType: ListingTypes.PRODUCT,
      });
    }
  };

  // Animation for plus button separation
  const plusTranslateX = useSharedValue(60);
  const plusOpacity = useSharedValue(0);

  React.useEffect(() => {
    plusTranslateX.value = withTiming(0, {
      duration: 600,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });
    plusOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [plusTranslateX, plusOpacity]);

  const plusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: plusTranslateX.value}],
    opacity: plusOpacity.value,
  }));

  return (
    <>
      <AddOptionsModal
        visible={showPopover}
        onClose={() => setShowPopover(false)}
        onSelectOption={handleSelectOption}
      />
      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: Math.max(bottom, scale(16)),
          },
        ]}>
        <View style={styles.mainContainer}>
          {/* Plus Icon Button - Separate from pill */}
          <Animated.View style={plusAnimatedStyle}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePlusPress}
              style={styles.plusButton}>
              <View style={styles.plusIconContainer}>
                <BlurView
                  style={styles.plusBlurBackground}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="white"
                />
                <View style={styles.plusTintOverlay} />
                <AppText style={styles.plusIcon}>+</AppText>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Tab Bar Pill */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.container}>
              <BlurView
                style={styles.blurBackground}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor="white"
              />
              <View style={styles.tintOverlay} />

              {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const tabIcon = getTabIcon(route.name, isFocused);
                const tabTitle = getTabTitle(route.name);

                return (
                  <AnimatedTabItem
                    key={route.key}
                    route={route}
                    index={index}
                    isFocused={isFocused}
                    tabIcon={tabIcon}
                    tabTitle={tabTitle}
                    onPress={onPress}
                    t={t}
                  />
                );
              })}
            </View>
          </GestureDetector>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(16),
    backgroundColor: 'transparent',
    borderRadius: scale(50),
    overflow: 'hidden',
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(100, 150, 255, 0.25)',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: scale(24),
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
    width: '100%',
    height: '100%',
    ...commonShadow,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
  },
  label: {
    fontSize: scale(14),
    color: colors.blue,
    ...primaryFont('500'),
  },
  tabIcon: {
    height: scale(24),
    width: scale(24),
  },
  plusButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconContainer: {
    backgroundColor: 'transparent',
    borderRadius: scale(24),
    width: scale(48),
    height: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  plusBlurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  plusTintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(100, 150, 255, 0.25)',
  },
  plusIcon: {
    fontSize: scale(28),
    color: colors.white,
    ...primaryFont('600'),
    lineHeight: scale(32),
  },
});
