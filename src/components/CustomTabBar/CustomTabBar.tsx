import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useMemo} from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import {bottomInset, scale, SCREEN_WIDTH} from '../../utils';
import {
  cartActive,
  cartInactive,
  homeActive,
  homeInactive,
  locationActive,
  locationInactive,
  ordersActive,
  ordersInactive,
} from '../../assets';
import {colors, primaryFont} from '../../constants';
import {TFunction} from 'i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {AppText} from '../AppText/AppText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
type TranslationTS = TFunction<'translation', undefined>;
type AnimatedTabItemProps = {
  route: any;
  index: number;
  isFocused: boolean;
  tabIcon: number;
  tabTitle: string;
  onPress: (route: any, index: number) => void;
  width: number;
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
    width,
    t,
  }: AnimatedTabItemProps) => {
    const scaleValue = useSharedValue(1);

    React.useEffect(() => {
      if (isFocused) {
        scaleValue.value = withSequence(
          withTiming(1.2, {duration: 150}),
          withTiming(1, {duration: 150}),
        );
      }
    }, [isFocused, scaleValue]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{scale: scaleValue.value}],
      };
    });

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onPress(route, index)}
        style={styles.tab}>
        <Animated.View style={[styles.tabItem, {width: width}, animatedStyle]}>
          <Image
            tintColor={isFocused ? colors.blue : colors.deepBlue}
            source={tabIcon}
            style={styles.tabIcon}
          />
        </Animated.View>
        <AppText
          style={[
            styles.label,
            {color: isFocused ? colors.blue : colors.deepBlue},
          ]}>
          {t(tabTitle)}
        </AppText>
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
  const ITEM_WIDTH = useMemo(
    () => SCREEN_WIDTH / state.routes.length,
    [state.routes.length],
  );

  const indicatorScaleValue = useSharedValue(state.index * ITEM_WIDTH);

  React.useEffect(() => {
    indicatorScaleValue.value = withTiming(state.index * ITEM_WIDTH, {
      duration: 250,
    });
  }, [state.index, indicatorScaleValue, ITEM_WIDTH]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: indicatorScaleValue.value}],
  }));

  const onPress = useCallback(
    (route: any, index: number) => {
      if (state.index !== index) {
        navigation.navigate(route.name);
      }
    },
    [state.index, navigation],
  );

  const getTabIcon = useCallback((route: string, isFocused: boolean) => {
    switch (route) {
      case 'Home':
        return isFocused ? homeActive : homeInactive;
      case 'MyOrders':
        return isFocused ? ordersActive : ordersInactive;
      case 'MyLocation':
        return isFocused ? locationActive : locationInactive;
      case 'Cart':
        return isFocused ? cartActive : cartInactive;
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
      case 'MyLocation':
        return 'Navigation.myLocation';
      case 'Cart':
        return 'Navigation.cart';
      default:
        return 'Navigation.home';
    }
  }, []);

  return (
    // <View style={styles.root}>
    <View
      style={[
        styles.container,
        {
          paddingTop: scale(20),
          paddingBottom: bottom,
        },
      ]}>
      <Animated.View
        style={[styles.indicator, {width: ITEM_WIDTH}, indicatorStyle]}>
        <View style={styles.indicatorLine} />
      </Animated.View>
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
            width={ITEM_WIDTH}
            t={t}
          />
        );
      })}
    </View>
    // </View>
  );
};

const styles = StyleSheet.create({
  root: {
    // backgroundColor: colors.white,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: scale(5),
    height: '100%',
  },
  indicatorLine: {
    height: scale(4),
    backgroundColor: colors.blue,
    alignSelf: 'center',
    width: scale(50),
  },
  tabItem: {
    alignItems: 'center',
    gap: scale(5),
  },
  label: {
    fontSize: scale(12),
    paddingTop: scale(5),
    ...primaryFont('400'),
  },
  tabIcon: {
    height: scale(24),
    width: scale(24),
  },
});

// import React, {useCallback, useMemo} from 'react';
// import {
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
// import {useTranslation} from 'react-i18next';
// import {bottomInset, scale, SCREEN_WIDTH} from '../../utils';
// import {
//   cartActive,
//   cartInactive,
//   homeActive,
//   homeInactive,
//   locationActive,
//   locationInactive,
//   ordersActive,
//   ordersInactive,
// } from '../../assets';
// import {colors, primaryFont} from '../../constants';
// import Animated, {Keyframe} from 'react-native-reanimated';
// import {AppText} from '../AppText/AppText';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import {TFunction} from 'i18next';

// // Type definitions
// type TranslationTS = TFunction<'translation', undefined>;

// type AnimatedTabItemProps = {
//   route: any;
//   index: number;
//   isFocused: boolean;
//   tabIcon: number;
//   tabTitle: string;
//   onPress: (route: any, index: number) => void;
//   width: number;
//   t: TranslationTS;
// };

// // 🔹 Keyframe for tab icon bounce
// const bounceKeyframe = new Keyframe({
//   0: {transform: [{scale: 1}]},
//   50: {transform: [{scale: 1.2}]},
//   100: {transform: [{scale: 1}]},
// }).duration(300);

// // 🔹 Function to generate dynamic keyframes for indicator movement
// const indicatorKeyframe = (from: number, to: number) =>
//   new Keyframe({
//     0: {transform: [{translateX: from}]},
//     60: {transform: [{translateX: to + (to - from) * 0.1}]}, // slight overshoot for bounce feel
//     100: {transform: [{translateX: to}]},
//   }).duration(350);

// const AnimatedTabItem = React.memo(
//   ({
//     route,
//     index,
//     isFocused,
//     tabIcon,
//     tabTitle,
//     onPress,
//     width,
//     t,
//   }: AnimatedTabItemProps) => {
//     return (
//       <TouchableOpacity
//         activeOpacity={0.5}
//         onPress={() => onPress(route, index)}
//         style={styles.tab}>
//         <Animated.View
//           entering={isFocused ? bounceKeyframe : undefined}
//           style={[styles.tabItem, {width}]}>
//           <Image
//             tintColor={isFocused ? colors.blue : colors.deepBlue}
//             source={tabIcon}
//             style={styles.tabIcon}
//           />
//         </Animated.View>
//         <AppText
//           entering={isFocused ? bounceKeyframe : undefined}
//           style={[
//             styles.label,
//             {color: isFocused ? colors.blue : colors.deepBlue},
//           ]}>
//           {t(tabTitle)}
//         </AppText>
//       </TouchableOpacity>
//     );
//   },
// );

// export const CustomTabBar: React.FC<BottomTabBarProps> = ({
//   state,
//   navigation,
// }) => {
//   const {t} = useTranslation();
//   const {bottom} = useSafeAreaInsets();

//   const ITEM_WIDTH = useMemo(
//     () => SCREEN_WIDTH / state.routes.length,
//     [state.routes.length],
//   );

//   const onPress = useCallback(
//     (route: any, index: number) => {
//       if (state.index !== index) {
//         navigation.navigate(route.name);
//       }
//     },
//     [state.index, navigation],
//   );

//   const getTabIcon = useCallback((route: string, isFocused: boolean) => {
//     switch (route) {
//       case 'Home':
//         return isFocused ? homeActive : homeInactive;
//       case 'MyOrders':
//         return isFocused ? ordersActive : ordersInactive;
//       case 'MyLocation':
//         return isFocused ? locationActive : locationInactive;
//       case 'Cart':
//         return isFocused ? cartActive : cartInactive;
//       default:
//         return null;
//     }
//   }, []);

//   const getTabTitle = useCallback((route: string) => {
//     switch (route) {
//       case 'Home':
//         return 'Navigation.home';
//       case 'MyOrders':
//         return 'Navigation.myOrders';
//       case 'MyLocation':
//         return 'Navigation.myLocation';
//       case 'Cart':
//         return 'Navigation.cart';
//       default:
//         return 'Navigation.home';
//     }
//   }, []);

//   // Calculate from and to for indicator keyframes
//   const prevIndex = state.previousIndex ?? 0;
//   const fromX = prevIndex * ITEM_WIDTH;
//   const toX = state.index * ITEM_WIDTH;

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           paddingTop: scale(20),
//           paddingBottom: bottomInset(bottom),
//         },
//       ]}>
//       {/* Indicator with keyframe animation */}
//       <Animated.View
//         key={state.index} // triggers entering animation on each index change
//         entering={indicatorKeyframe(fromX, toX)}
//         style={[styles.indicator, {width: ITEM_WIDTH}]}>
//         <View style={styles.indicatorLine} />
//       </Animated.View>

//       {/* Tabs */}
//       {state.routes.map((route, index) => {
//         const isFocused = state.index === index;
//         const tabIcon = getTabIcon(route.name, isFocused);
//         const tabTitle = getTabTitle(route.name);

//         return (
//           <AnimatedTabItem
//             key={route.key}
//             route={route}
//             index={index}
//             isFocused={isFocused}
//             tabIcon={tabIcon}
//             tabTitle={tabTitle}
//             onPress={onPress}
//             width={ITEM_WIDTH}
//             t={t}
//           />
//         );
//       })}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//   },
//   tab: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   indicator: {
//     position: 'absolute',
//     top: scale(5),
//     height: '100%',
//   },
//   indicatorLine: {
//     height: scale(4),
//     backgroundColor: colors.blue,
//     alignSelf: 'center',
//     width: scale(50),
//     borderRadius: scale(2),
//   },
//   tabItem: {
//     alignItems: 'center',
//     gap: scale(5),
//   },
//   label: {
//     fontSize: scale(12),
//     paddingTop: scale(5),
//     ...primaryFont('400'),
//   },
//   tabIcon: {
//     height: scale(24),
//     width: scale(24),
//   },
// });
