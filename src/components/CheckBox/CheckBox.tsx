import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Control, Controller} from 'react-hook-form';
import {colors} from '../../constants';
import {scale} from '../../utils';

interface CheckBoxProps {
  control: Control<any>;
  name: string;
}

export const CheckBox: React.FC<CheckBoxProps> = ({control, name}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({field: {onChange, value}}) => (
        <TouchableOpacity
          style={styles.container}
          onPress={() => onChange(!value)}
          activeOpacity={0.7}>
          <View style={[styles.checkbox, value && styles.checked]}>
            {value && <View style={styles.checkmark} />}
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: scale(4),
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderWidth: 2,
    borderColor: colors.lightGrey,
    borderRadius: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checked: {
    backgroundColor: colors.deepBlue,
    borderColor: colors.deepBlue,
  },
  checkmark: {
    width: scale(8),
    height: scale(8),
    backgroundColor: colors.white,
    borderRadius: scale(1),
  },
});
