import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import React, {ReactNode} from 'react';
import {hitSlope, scale} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {useLanguage} from '../../hooks';

export interface ScreenHeaderProps {
  renderLeft?: () => ReactNode;
  renderCenter?: () => ReactNode;
  renderRight?: () => ReactNode;
  leftIcon?: ImageSourcePropType;
  leftIconPress?: () => void;
  rightIcon?: ImageSourcePropType;
  rightIconPress?: () => void;
  centerIcon?: ImageSourcePropType;
  centerIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const ScreenHeader = ({
  renderLeft,
  renderCenter,
  renderRight,
  leftIcon,
  leftIconPress,
  rightIcon,
  rightIconPress,
  centerIcon,
  centerIconPress,
  containerStyle,
}: ScreenHeaderProps) => {
  const navigation = useNavigation();
  const {isArabic} = useLanguage();

  return (
    <View style={[styles.container, containerStyle]}>
      {renderLeft ? (
        renderLeft()
      ) : leftIcon ? (
        <TouchableOpacity
          hitSlop={hitSlope(15)}
          onPress={leftIconPress || (() => navigation.goBack())}>
          <Image
            style={[isArabic && {transform: [{scaleX: -1}]}]}
            source={leftIcon}
          />
        </TouchableOpacity>
      ) : null}

      <View style={styles.centerContainer}>
        {renderCenter
          ? renderCenter()
          : centerIcon && (
              <TouchableOpacity
                hitSlop={hitSlope(15)}
                onPress={centerIconPress}>
                <Image source={centerIcon} resizeMode="contain" />
              </TouchableOpacity>
            )}
      </View>

      {renderRight ? (
        renderRight()
      ) : rightIcon ? (
        <TouchableOpacity hitSlop={hitSlope(15)} onPress={rightIconPress}>
          <Image source={rightIcon} resizeMode="contain" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  centerContainer: {
    position: 'absolute', // ← ensures it's always visually centered
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
