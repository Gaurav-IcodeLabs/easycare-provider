import React, {useRef, useState, useEffect} from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
} from 'react-native';
import {AppText, Button, ErrorMessage, GradientWrapper} from '../../components';
import {useTranslation} from 'react-i18next';
import {colors, primaryFont} from '../../constants';
import {fontScale, scale, topInset} from '../../utils';
import OtpInputField from './components/OtpInputField';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {mail} from '../../assets';
import {useLanguage} from '../../hooks';
import {currentUserPhoneNumberSelector} from '../../slices/user.slice';
import {useTypedSelector} from '../../sharetribeSetup';
import PhoneInput from 'react-native-phone-number-input';
import {useForm, Controller} from 'react-hook-form';

type PhoneFormValues = {
  phoneNumber: string;
};

export const VerifyOtp: React.FC = () => {
  const {t} = useTranslation();
  const {isArabic} = useLanguage();
  const currentUserPhoneNumber = useTypedSelector(
    currentUserPhoneNumberSelector,
  );

  // OTP State
  const [otp, setOtp] = useState('');
  const [isError, setIsError] = useState(false);

  // Timer State
  const [seconds, setSeconds] = useState(30);

  // Phone Input State
  const [formattedValue, setFormattedValue] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const phoneInputRef = useRef<PhoneInput>(null);

  const {
    control,
    handleSubmit,
    trigger,
    formState: {errors, isValid},
  } = useForm<PhoneFormValues>({
    mode: 'onChange',
    defaultValues: {phoneNumber: ''},
  });

  // Countdown Timer
  useEffect(() => {
    if (!currentUserPhoneNumber || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds(s => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUserPhoneNumber, seconds]);

  const formatTimer = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    const time = `${m}:${s}`;

    if (isArabic) {
      return time.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    }
    return time;
  };

  const handleResendOtp = () => {
    setSeconds(30);
    setOtp('');
    setIsError(false);
    // TODO: Call your resend OTP API here
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setIsError(false);
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 4) return;
    // TODO: Verify OTP with backend
    console.log('Submitting OTP:', otp);
  };

  const handlePhoneSubmit = () => {
    if (!phoneInputRef.current) return;
    const fullNumber =
      phoneInputRef.current.getNumberAfterPossiblyEliminatingZero();
    console.log('Saving phone:', fullNumber);
    // TODO: Save phone number + trigger OTP send
  };

  const renderOtpVerification = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContainer}>
          <View style={styles.contentWrapper}>
            <View style={styles.cardContent}>
              <Image style={styles.illustration} source={mail} />
              <AppText style={styles.heading}>{t('Signin.subheading')}</AppText>
              <AppText style={styles.description}>
                {t('Signin.message')}
              </AppText>

              {currentUserPhoneNumber && (
                <View style={styles.phoneChip}>
                  <AppText style={styles.phoneChipText}>
                    {currentUserPhoneNumber}
                  </AppText>
                </View>
              )}

              <View style={styles.otpSection}>
                <OtpInputField
                  length={4}
                  onOtpChange={handleOtpChange}
                  autoFocus={true}
                  value={otp}
                />
                {isError && (
                  <ErrorMessage
                    textStyles={styles.errorMessage}
                    error={t('Signin.invalidOtp')}
                  />
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                disabled={otp.length !== 4}
                title={t('Signin.button')}
                onPress={handleOtpSubmit}
                style={styles.button}
              />

              <View style={styles.helperSection}>
                <AppText style={styles.nototp}>
                  {t('Signin.otpNotRecieved')}
                </AppText>

                <View
                  style={[
                    styles.timerContainer,
                    isArabic && styles.timerContainerRTL,
                  ]}>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={seconds > 0}>
                    <AppText
                      style={[styles.resend, seconds > 0 && {opacity: 0.6}]}>
                      {t('Signin.resend')}
                    </AppText>
                  </TouchableOpacity>

                  {seconds > 0 && (
                    <AppText style={[styles.resend, styles.timerText]}>
                      {' - '}
                      {formatTimer(seconds)}
                    </AppText>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const renderPhoneNumberCapture = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContainer}>
          <View style={styles.contentWrapper}>
            <View style={styles.cardContent}>
              <Image style={styles.illustration} source={mail} />
              <AppText style={styles.heading}>
                {t('Signin.noPhoneHeading')}
              </AppText>
              <AppText style={styles.description}>
                {t('Signin.noPhoneMessage')}
              </AppText>

              <View style={styles.phoneInputSpacing}>
                <Controller
                  control={control}
                  name="phoneNumber"
                  rules={{
                    required: t('Signup.phoneRequired'),
                    validate: () => {
                      if (!phoneInputRef.current) return true;
                      const valid =
                        phoneInputRef.current.isValidNumber(formattedValue);
                      return valid || t('Signup.invalidPhoneNumber');
                    },
                  }}
                  render={({field: {onChange}}) => (
                    <>
                      <PhoneInput
                        ref={phoneInputRef}
                        defaultCode="IN"
                        layout="second"
                        value={formattedValue}
                        onChangeFormattedText={text => {
                          setFormattedValue(text);
                          onChange(text);
                          trigger('phoneNumber');
                        }}
                        onChangeText={() => {
                          console.log('change');
                          trigger('phoneNumber');
                        }}
                        onChangeCountry={() => trigger('phoneNumber')}
                        containerStyle={[
                          styles.phoneContainer,
                          styles.inputStyles,
                          isPhoneFocused && styles.phoneFocused,
                          errors.phoneNumber && styles.phoneError,
                        ]}
                        textContainerStyle={styles.phoneTextContainer}
                        textInputStyle={getInputStyle(isArabic)}
                        codeTextStyle={styles.phoneCodeText}
                        flagButtonStyle={styles.phoneFlagButton}
                        countryPickerButtonStyle={
                          styles.phoneCountryPickerButton
                        }
                        disableArrowIcon
                        textInputProps={{
                          onFocus: () => setIsPhoneFocused(true),
                          onBlur: () => {
                            setIsPhoneFocused(false);
                            trigger('phoneNumber');
                          },
                          placeholderTextColor:
                            colors.placeholder || colors.neutralDark,
                          allowFontScaling: false,
                        }}
                      />
                      {errors.phoneNumber && (
                        <ErrorMessage
                          error={
                            errors.phoneNumber.message ||
                            t('Signup.invalidPhoneNumber')
                          }
                        />
                      )}
                    </>
                  )}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title={t('Signin.savePhoneButton')}
                style={styles.button}
                disabled={!isValid}
                onPress={handleSubmit(handlePhoneSubmit)}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  const getInputStyle = (isRTL: boolean): any => [
    styles.phoneTextInput,
    {textAlign: isRTL ? 'right' : 'left'},
  ];

  return (
    <GradientWrapper colors={[colors.white, colors.white]}>
      {currentUserPhoneNumber
        ? renderOtpVerification()
        : renderPhoneNumberCapture()}
    </GradientWrapper>
  );
};

// Styles unchanged (same as yours)
const styles = StyleSheet.create({
  flex: {flex: 1},
  screenContainer: {
    flex: 1,
    paddingTop: topInset + scale(24),
    paddingHorizontal: scale(24),
    paddingBottom: scale(32),
    backgroundColor: colors.white,
  },
  contentWrapper: {flex: 1, justifyContent: 'center'},
  cardContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingVertical: scale(32),
  },
  illustration: {
    alignSelf: 'center',
    height: scale(110),
    width: scale(110),
    marginBottom: scale(24),
  },
  heading: {
    color: colors.deepBlue,
    fontSize: scale(24),
    ...primaryFont('600'),
    textAlign: 'center',
  },
  description: {
    fontSize: scale(15),
    color: colors.neutralDark,
    ...primaryFont('400'),
    textAlign: 'center',
    lineHeight: scale(22),
    marginTop: scale(12),
  },
  phoneChip: {
    alignSelf: 'center',
    marginTop: scale(16),
    paddingHorizontal: scale(18),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    backgroundColor: colors.lightGrey,
  },
  phoneChipText: {
    color: colors.deepBlue,
    ...primaryFont('500'),
    fontSize: fontScale(14),
  },
  otpSection: {marginTop: scale(32), alignItems: 'center'},
  errorMessage: {
    fontSize: scale(16),
    marginTop: scale(12),
    textAlign: 'center',
    ...primaryFont('500'),
  },
  button: {
    marginTop: scale(8),
    backgroundColor: colors.deepBlue,
    borderRadius: scale(12),
    height: scale(56),
  },
  helperSection: {marginTop: scale(16), alignItems: 'center'},
  nototp: {
    textAlign: 'center',
    ...primaryFont('400'),
    fontSize: fontScale(14),
    color: colors.neutralDark,
  },
  resend: {
    textAlign: 'center',
    ...primaryFont('500'),
    fontSize: fontScale(14.5),
    color: colors.blue,
    paddingTop: scale(5),
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainerRTL: {flexDirection: 'row-reverse'},
  timerText: {color: colors.neutralDark},
  phoneInputSpacing: {marginTop: scale(24)},
  footer: {marginTop: scale(16)},
  inputStyles: {borderRadius: scale(12), height: scale(56)},
  phoneContainer: {
    width: '100%',
    height: scale(56),
    borderWidth: scale(1),
    borderColor: colors.lightGrey || colors.neutralDark,
    backgroundColor: colors.white,
  },
  phoneFocused: {borderColor: colors.deepBlue},
  phoneError: {borderColor: '#FF0000'},
  phoneTextContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  phoneTextInput: {
    height: scale(56),
    fontSize: scale(16),
    color: colors.black,
    ...primaryFont('400'),
  },
  phoneCodeText: {
    fontSize: scale(20),
    color: colors.black,
    ...primaryFont('400'),
    fontWeight: 'normal',
  },
  phoneFlagButton: {transform: [{scale: 0.8}]},
  phoneCountryPickerButton: {alignItems: 'center', justifyContent: 'center'},
});
