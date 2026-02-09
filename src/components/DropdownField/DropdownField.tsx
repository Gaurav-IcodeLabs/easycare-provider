import React, {useState} from 'react';
import {StyleSheet, View, ViewStyle, TextStyle} from 'react-native';
import {Control, Controller, FieldValues, Path} from 'react-hook-form';
import {Dropdown} from 'react-native-element-dropdown';
import {useTranslation} from 'react-i18next';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage';
import {AppText} from '../AppText/AppText';

interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean; // Add support for disabled individual options
}

export type {DropdownOption};

interface DropdownFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  placeholder?: string;
  options: DropdownOption[];
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
}

export const DropdownField = <T extends FieldValues>({
  control,
  name,
  labelKey,
  placeholder,
  options,
  containerStyle = {},
  labelStyle = {},
  disabled = false,
}: DropdownFieldProps<T>) => {
  const {t} = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const label = labelKey ? t(labelKey) : undefined;
  const placeholderText = placeholder ? t(placeholder) : t('Select an option');

  return (
    <Controller
      control={control}
      name={name}
      render={({field: {value, onChange}, fieldState: {error}}) => {
        return (
          <>
            <View style={[styles.container, containerStyle]}>
              {label && (
                <View style={styles.labelContainer}>
                  <AppText style={[styles.text, labelStyle]}>{label}</AppText>
                </View>
              )}

              <Dropdown
                data={options}
                labelField="label"
                valueField="value"
                placeholder={placeholderText}
                value={value}
                onChange={item => {
                  // Prevent selection of disabled items
                  if (!item?.disabled) {
                    onChange(item.value);
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disable={disabled}
                style={[
                  styles.dropdown,
                  isFocused && !disabled && styles.focused,
                  error && styles.error,
                  disabled && styles.disabled,
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropdownContainer}
                itemTextStyle={styles.itemTextStyle}
                renderItem={(item: DropdownOption) => (
                  <View
                    style={[
                      styles.itemContainer,
                      item?.disabled && styles.disabledItem,
                    ]}>
                    <AppText
                      style={[
                        styles.itemTextStyle,
                        item?.disabled && styles.disabledItemText,
                      ]}>
                      {item.label}
                      {item?.disabled && ' (Unavailable)'}
                    </AppText>
                  </View>
                )}
              />
            </View>

            {error?.message && <ErrorMessage error={error.message} />}
          </>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scale(16),
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
    borderRadius: scale(100),
    paddingHorizontal: scale(16),
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
  },
  itemTextStyle: {
    fontSize: scale(16),
    color: colors.black,
    ...primaryFont('400'),
  },
  disabled: {
    backgroundColor: colors.lightGrey,
    opacity: 0.6,
  },
  itemContainer: {
    padding: scale(12),
  },
  disabledItem: {
    opacity: 0.5,
    backgroundColor: colors.lightGrey,
  },
  disabledItemText: {
    color: colors.grey,
    textDecorationLine: 'line-through',
  },
});
