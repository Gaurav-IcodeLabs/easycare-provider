/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors as COLORS} from '../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  colors?: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
}

export const GradientWrapper: React.FC<GradientBackgroundProps> = ({
  children,
  colors = [COLORS.deepBlue, COLORS.blue],
  start = {x: 0.5, y: 0},
  end = {x: 0.5, y: 1},
}) => {
  const {top, left, right} = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: -1,
        },
      ]}>
      <View
        style={{
          flex: 1,
          marginTop: top,
          marginLeft: left,
          marginRight: right,
        }}>
        {children}
      </View>
    </LinearGradient>
  );
};
