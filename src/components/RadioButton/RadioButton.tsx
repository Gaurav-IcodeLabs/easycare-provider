import React from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {scale} from '../../utils';
import {colors} from '../../constants';

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onPress,
  size = 22,
  color = colors.deepBlue,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, style]}>
      <View
        style={[
          styles.radio,
          {
            width: scale(size),
            height: scale(size),
            borderRadius: scale(size / 2),
            borderColor: selected ? color : colors.lightGrey,
          },
          disabled && styles.disabled,
        ]}>
        {selected && (
          <View
            style={[
              styles.radioDot,
              {
                width: scale(size * 0.55),
                height: scale(size * 0.55),
                borderRadius: scale((size * 0.55) / 2),
                backgroundColor: color,
              },
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: scale(4),
  },
  radio: {
    borderWidth: scale(2),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  radioDot: {},
  disabled: {
    opacity: 0.5,
  },
});
