import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle, TextStyle} from 'react-native';
import {Control, Controller, FieldValues, Path} from 'react-hook-form';
import {MultiSelect} from 'react-native-element-dropdown';
import {useTranslation} from 'react-i18next';

import {AppText} from '../AppText/AppText';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage';
import {colors, primaryFont} from '../../constants';
import {scale} from '../../utils';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface DropdownMultiSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: MultiSelectOption[];

  labelKey?: string;
  placeholderKey?: string;

  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const DropdownMultiSelectField = <T extends FieldValues>({
  control,
  name,
  options,
  labelKey,
  placeholderKey,
  disabled = false,
  containerStyle,
  labelStyle,
}: DropdownMultiSelectFieldProps<T>) => {
  const {t} = useTranslation();

  const label = labelKey ? t(labelKey) : undefined;
  const placeholder = placeholderKey ? t(placeholderKey) : t('Select options');

  return (
    <Controller
      control={control}
      name={name}
      render={({field: {value = [], onChange}, fieldState: {error}}) => (
        <>
          <View style={[styles.container, containerStyle]}>
            {label && (
              <View style={styles.labelContainer}>
                <AppText style={[styles.text, labelStyle]}>{label}</AppText>
              </View>
            )}

            <MultiSelect
              data={options}
              labelField="label"
              valueField="value"
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disable={disabled}
              style={[styles.dropdown, error && styles.errorBorder]}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemTextStyle={styles.itemTextStyle}
              selectedStyle={styles.selectedItemStyle}
              activeColor={colors.borderBlue}
            />
          </View>

          {error?.message && <ErrorMessage error={error.message} />}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    // marginTop: scale(16),
    marginBottom: scale(16),
  },
  labelContainer: {
    marginBottom: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: scale(16),
    color: colors.neutralDark,
    ...primaryFont('400'),
  },
  dropdown: {
    height: scale(48),
    borderWidth: scale(1),
    borderColor: colors.lightGrey || colors.neutralDark,
    backgroundColor: colors.white,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
  },
  errorBorder: {
    borderColor: colors.red,
  },
  focused: {
    borderColor: colors.deepBlue,
  },
  error: {
    borderColor: colors.red,
  },
  placeholderStyle: {
    fontSize: scale(16),
    color: colors.placeholder || colors.neutralDark,
    ...primaryFont('400'),
  },
  selectedTextStyle: {
    fontSize: scale(16),
    color: colors.black,
    ...primaryFont('400'),
  },
  dropdownContainer: {
    borderRadius: scale(12),
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  itemTextStyle: {
    fontSize: scale(16),
    color: colors.neutralDark,
    ...primaryFont('400'),
  },
  selectedItemStyle: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    gap: scale(5),
    borderRadius: scale(100),
    borderWidth: StyleSheet.hairlineWidth,
  },
});
