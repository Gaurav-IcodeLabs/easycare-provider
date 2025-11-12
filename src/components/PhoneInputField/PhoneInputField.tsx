import React, {useRef, useState} from 'react';
import {StyleSheet, TextInput, View, ViewStyle} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {Control, Controller, FieldValues, Path} from 'react-hook-form';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {useTranslation} from 'react-i18next';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage';
import {AppText} from '../AppText/AppText';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

interface PhoneInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  inputContainerStyles?: ViewStyle;
  insideBottomSheet?: boolean;
  setError: (name: Path<T>, error: {type: string; message?: string}) => void;
  clearErrors: (name: Path<T>) => void;
}

export const PhoneInputField = <T extends FieldValues>({
  control,
  name,
  labelKey,
  inputContainerStyles = {},
  insideBottomSheet = false,
  setError,
  clearErrors,
}: PhoneInputFieldProps<T>) => {
  const {t} = useTranslation();
  const phoneInput = useRef<PhoneInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const label = labelKey ? t(labelKey) : undefined;

  const validatePhoneNumber = () => {
    if (!phoneInput.current) {
      return;
    }

    const currentValue = phoneInput.current.state.number;
    if (!currentValue) {
      clearErrors(name);
      return;
    }

    const isValid = phoneInput.current.isValidNumber(currentValue);
    if (isValid) {
      clearErrors(name);
    } else {
      setError(name, {
        type: 'manual',
        message: t('Signup.invalidPhoneNumber'),
      });
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{required: true}} // optional: add if needed
      render={({field: {value, onChange}, fieldState: {error}}) => (
        <>
          <View style={styles.container}>
            {label && (
              <View style={styles.labelContainer}>
                <AppText style={styles.text}>{label}</AppText>
              </View>
            )}

            <PhoneInput
              ref={phoneInput}
              value={value}
              defaultCode="IN"
              layout="second"
              onChangeFormattedText={onChange}
              withDarkTheme={false}
              withShadow={false}
              autoFocus={false}
              containerStyle={[
                styles.phoneContainer,
                inputContainerStyles,
                isFocused && styles.focused,
              ]}
              disableArrowIcon
              textContainerStyle={styles.textContainer}
              textInputStyle={styles.textInput}
              codeTextStyle={styles.codeText}
              flagButtonStyle={styles.flagButton}
              onChangeCountry={validatePhoneNumber}
              countryPickerButtonStyle={styles.countryPickerButton}
              textInputProps={{
                onFocus: () => setIsFocused(true),
                onBlur: () => {
                  setIsFocused(false);
                  validatePhoneNumber(); // ← now uses fresh value from ref
                },
                placeholderTextColor: colors.placeholder || colors.neutralDark,
                allowFontScaling: false,
              }}
              TextInputComponent={
                insideBottomSheet ? BottomSheetTextInput : TextInput
              }
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
  phoneContainer: {
    width: '100%',
    height: scale(52),
    borderWidth: scale(1),
    borderColor: colors.lightGrey || colors.neutralDark,
    backgroundColor: colors.white,
    borderRadius: scale(100),
  },
  focused: {
    borderColor: colors.deepBlue,
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textInput: {
    height: scale(52),
    fontSize: scale(16),
    color: colors.black,
    ...primaryFont('400'),
  },
  codeText: {
    fontSize: scale(20),
    color: colors.black,
    ...primaryFont('400'),
    fontWeight: 'normal',
  },
  flagButton: {
    transform: [{scale: 0.8}],
  },
  countryPickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
