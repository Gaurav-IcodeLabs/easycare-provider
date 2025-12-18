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
import {colors, primaryFont, SCREENS} from '../../constants';
import {fontScale, scale, useToast} from '../../utils';
import OtpInputField from './components/OtpInputField';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {phoneVerification} from '../../assets';
import {useLanguage} from '../../hooks';
import {
  currentUserPhoneNumberSelector,
  updateCurrentUser,
} from '../../slices/user.slice';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import PhoneInput from 'react-native-phone-number-input';
import {useForm, Controller} from 'react-hook-form';
import {checkPhoneNumberExists, sendOTP, verifyOTP} from '../../utils/api';
import {useNavigation} from '@react-navigation/native';

type PhoneFormValues = {
  phoneNumber: string;
};

export const VerifyOtp: React.FC = () => {
  const {t} = useTranslation();
  const {showToast} = useToast();
  const {isArabic} = useLanguage();
  const currentUserPhoneNumber = useTypedSelector(
    currentUserPhoneNumberSelector,
  );

  // OTP State
  const [otp, setOtp] = useState('');

  // Loading States
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Timer State
  const [seconds, setSeconds] = useState(30);

  // Phone Input State
  const [formattedValue, setFormattedValue] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const phoneInputRef = useRef<PhoneInput>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

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
    if (!currentUserPhoneNumber || seconds <= 0) {
      return;
    }

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
      return time.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
    }
    return time;
  };

  const handleResendOtp = async () => {
    if (!currentUserPhoneNumber || isResending) {
      return;
    }

    setIsResending(true);
    try {
      await sendOTP({phoneNumber: currentUserPhoneNumber});
      setSeconds(30);
      setOtp('');
      showToast({
        type: 'success',
        title: t('Signin.otpResent'),
        message: t('Signin.otpResentMessage'),
      });
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      showToast({
        type: 'error',
        title: t('Signin.errorTitle'),
        message: error?.response?.data?.message || t('Signin.resendError'),
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleOtpSubmit = async () => {
    if (!currentUserPhoneNumber || otp.length !== 6 || isVerifying) {
      return;
    }

    setIsVerifying(true);
    try {
      if (!__DEV__) {
        await verifyOTP({phoneNumber: currentUserPhoneNumber, code: otp});
      }
      showToast({
        type: 'success',
        title: t('Signin.successTitle'),
        message: t('Signin.verifySuccess'),
      });
      // TODO: Navigate to next screen or update user state
      dispatch(updateCurrentUser({publicData: {phoneNumberVerified: true}}));
      navigation.navigate(SCREENS.MAIN_TABS);
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      showToast({
        type: 'error',
        title: t('Signin.errorTitle'),
        message: error?.response?.data?.message || t('Signin.verifyError'),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneInputRef.current || isSendingOtp) {
      return;
    }
    const fullNumber =
      phoneInputRef.current.getNumberAfterPossiblyEliminatingZero();
    console.log('fullNumber', fullNumber);
    setIsSendingOtp(true);
    try {
      const {phoneNumberExists} = await checkPhoneNumberExists({
        phoneNumber: fullNumber.formattedNumber,
      });
      if (phoneNumberExists) {
        showToast({
          type: 'error',
          title: t('Signin.errorTitle'),
          message: t('Signin.phoneAlreadyExists'),
        });
        return;
      }
      await sendOTP({phoneNumber: fullNumber.formattedNumber});
      dispatch(
        updateCurrentUser({
          protectedData: {
            phoneNumber: fullNumber.formattedNumber,
          },
        }),
      );
      showToast({
        type: 'success',
        title: t('Signin.successTitle'),
        message: t('Signin.otpSent'),
      });
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      showToast({
        type: 'error',
        title: t('Signin.errorTitle'),
        message: error?.response?.data?.message || t('Signin.sendError'),
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const renderOtpVerification = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContainer}>
          <View style={styles.contentWrapper}>
            <View style={styles.cardContent}>
              <Image style={styles.illustration} source={phoneVerification} />
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
                  length={6}
                  onOtpChange={handleOtpChange}
                  autoFocus={true}
                  value={otp}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                disabled={otp.length !== 6 || isVerifying}
                title={t('Signin.button')}
                onPress={handleOtpSubmit}
                style={styles.button}
                loader={isVerifying}
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
                    disabled={seconds > 0 || isResending}>
                    <AppText
                      style={[
                        styles.resend,
                        (seconds > 0 || isResending) && styles.resendDisabled,
                      ]}>
                      {isResending ? t('Signin.sending') : t('Signin.resend')}
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
              <Image style={styles.illustration} source={phoneVerification} />
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
                      if (!phoneInputRef.current) {
                        return true;
                      }
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
                disabled={!isValid || isSendingOtp}
                onPress={handleSubmit(handlePhoneSubmit)}
                loader={isSendingOtp}
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
    paddingHorizontal: scale(20),
    justifyContent: 'center',
  },
  contentWrapper: {flex: 1, marginTop: scale(60)},
  cardContent: {},
  illustration: {
    alignSelf: 'center',
    height: scale(140),
    width: scale(140),
    marginBottom: scale(35),
  },
  heading: {
    color: colors.black,
    fontSize: scale(24),
    ...primaryFont('600'),
    textAlign: 'center',
    marginBottom: scale(10),
  },
  description: {
    fontSize: scale(15),
    color: colors.neutralDark,
    ...primaryFont('400'),
    textAlign: 'center',
    lineHeight: scale(22),
  },
  phoneChip: {
    alignSelf: 'center',
    marginTop: scale(16),
    paddingHorizontal: scale(18),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    backgroundColor: colors.lightGrey,
    marginBottom: scale(75),
  },
  phoneChipText: {
    color: colors.deepBlue,
    ...primaryFont('500'),
    fontSize: fontScale(14),
  },
  otpSection: {},
  errorMessage: {
    fontSize: scale(16),
    marginTop: scale(12),
    textAlign: 'center',
    ...primaryFont('500'),
  },
  button: {height: scale(52), marginTop: scale(60)},
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
  resendDisabled: {opacity: 0.6},
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
