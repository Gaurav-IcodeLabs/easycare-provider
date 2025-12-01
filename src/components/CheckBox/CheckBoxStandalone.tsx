import React from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {scale} from '../../utils';
import {colors} from '../../constants';

interface CheckBoxStandaloneProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  borderRadius?: number;
}

export const CheckBoxStandalone: React.FC<CheckBoxStandaloneProps> = ({
  checked,
  onPress,
  size = 22,
  color = colors.deepBlue,
  disabled = false,
  style,
  borderRadius = 5,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, style]}>
      <View
        style={[
          styles.checkbox,
          {
            width: scale(size),
            height: scale(size),
            borderRadius: scale(borderRadius),
            borderColor: checked ? color : colors.lightGrey,
            backgroundColor: checked ? color : colors.white,
          },
          disabled && styles.disabled,
        ]}>
        {checked && (
          <View
            style={[
              styles.checkmark,
              {
                width: scale(size * 0.45),
                height: scale(size * 0.45),
                borderRadius: scale(2),
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
  checkbox: {
    borderWidth: scale(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    backgroundColor: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});
