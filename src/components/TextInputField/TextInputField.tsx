import React, {useState, ReactNode} from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Control, Controller, FieldValues, Path} from 'react-hook-form';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {useTranslation} from 'react-i18next';
import {ErrorMessage} from '../ErrorMessage/ErrorMessage';
import {eyeClose, eyeOpen} from '../../assets/images';
import {useLanguage} from '../../hooks';
import {AppText} from '../AppText/AppText';

interface TextInputFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  isPassword?: boolean;
  leftIcon?: ImageSourcePropType;
  leftIconStyle?: ImageStyle;
  inputContainerStyles?: ViewStyle;
  labelStyle?: TextStyle;
  rightView?: ReactNode;
}

// Stable styles (outside render)
const getInputStyle = (
  isArabic: boolean,
): (TextStyle | {textAlign: 'right' | 'left'})[] => [
  styles.input,
  {textAlign: isArabic ? 'right' : 'left'},
];

export const TextInputField = <T extends FieldValues>({
  control,
  name,
  labelKey,
  style = {},
  isPassword = false,
  inputContainerStyles = {},
  labelStyle = {},
  placeholder: placeholderKey,
  leftIcon,
  leftIconStyle,
  rightView,
  ...textInputProps
}: TextInputFieldProps<T>) => {
  const {t} = useTranslation();
  const {isArabic} = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const placeholderString = t(placeholderKey ?? '');
  const label = labelKey ? t(labelKey) : undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({field: {value, onChange, onBlur}, fieldState: {error}}) => {
        return (
          <>
            <View style={styles.rowStyle}>
              <View style={[styles.container, style]}>
                {label && (
                  <View style={styles.labelContainer}>
                    <AppText style={[styles.text, labelStyle]}>{label}</AppText>
                  </View>
                )}

                <View
                  style={[
                    styles.inputContainer,
                    inputContainerStyles,
                    isFocused && styles.focused,
                  ]}>
                  {leftIcon && (
                    <Image
                      style={[styles.leftIcon, leftIconStyle]}
                      source={leftIcon}
                    />
                  )}

                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      onBlur();
                      setIsFocused(false);
                    }}
                    placeholder={placeholderString}
                    placeholderTextColor={
                      colors.placeholder || colors.neutralDark
                    }
                    secureTextEntry={isPassword && !showPassword}
                    style={[
                      getInputStyle(isArabic),
                      textInputProps.multiline && {paddingVertical: scale(10)},
                    ]}
                    allowFontScaling={false}
                    {...textInputProps}
                  />

                  {isPassword && (
                    <TouchableOpacity
                      onPress={() => setShowPassword(prev => !prev)}
                      style={styles.passwordToggle}>
                      <Image
                        source={showPassword ? eyeOpen : eyeClose}
                        style={styles.icon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {rightView && <View style={styles.rightView}>{rightView}</View>}
            </View>

            {error?.message && <ErrorMessage error={error.message} />}
          </>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {marginTop: scale(16), flexGrow: 1},
  rowStyle: {flexDirection: 'row', alignItems: 'flex-start'},
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
  inputContainer: {
    paddingHorizontal: scale(16),
    height: scale(48),
    borderWidth: scale(1),
    borderColor: colors.lightGrey || colors.neutralDark,
    backgroundColor: colors.white,
    borderRadius: scale(100),
    flexDirection: 'row',
    alignItems: 'center',
  },
  focused: {borderColor: colors.deepBlue},
  input: {
    flex: 1,
    height: '100%',
    color: colors.black,
    fontSize: scale(16),
    ...primaryFont('400'),
  },
  icon: {width: scale(20), height: scale(20)},
  passwordToggle: {marginLeft: scale(16)},
  leftIcon: {width: scale(16), height: scale(16), marginRight: scale(10)},
  rightView: {alignSelf: 'center', marginTop: scale(16), marginLeft: scale(8)},
});
