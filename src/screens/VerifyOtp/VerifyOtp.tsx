import {
  Image,
  InteractionManager,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {AppText, Button, ErrorMessage} from '../../components';
import {useTranslation} from 'react-i18next';
import {colors, primaryFont, AUTH, secondaryFont} from '../../constants';
import {fontScale, scale, topInset} from '../../utils';
import OtpInputField from './components/OtpInputField';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {VerifyOtpScreenProps} from '../../appTypes';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {backIcon, mail} from '../../assets';
import {useLanguage} from '../../hooks';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useAppSelector} from '../../store/setup';
// import {deeplinkTokenSelector} from '../../slices/common.slice';

export const VerifyOtp: React.FC = () => {
  const {t} = useTranslation();
  const {isArabic} = useLanguage();
  const navigation = useNavigation<VerifyOtpScreenProps['navigation']>();
  const route = useRoute<VerifyOtpScreenProps['route']>();
  const {token = ''} = route.params || {};
  const [otp, setOtp] = useState('');
  const [backendOtp, setBackendOtp] = useState('');
  const [isError, setIsError] = useState(false);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setShouldAutoFocus(true);
      });

      return () => {
        task.cancel();
        setShouldAutoFocus(false);
      };
    }, []),
  );

  // useEffect(() => {
  //   if (!token) {
  //     return;
  //   }
  //   const sendOtpRequest = async () => {
  //     try {
  //       const response = await sendOtp({token});
  //       setBackendOtp(response?.data?.otp);
  //     } catch (error) {
  //       console.error('Error sending OTP:', error);
  //     }
  //   };
  //   sendOtpRequest();
  // }, [token]);

  const handleOtpChange = (currentOtp: string) => {
    setIsError(false);
    setOtp(currentOtp);
  };
  const isOtpValid = otp.length === 4;

  const handleSubmit = async () => {
    if (!isOtpValid) {
      return;
    }
    // console.log('OTP entered:', otp);
    // console.log('Phone number (token):', token);
    // TODO: Verify OTP with backend
    // After successful verification, navigate to OtpVerified screen
    navigation.navigate(AUTH.OTP_VERIFIED as never);
  };

  // Format timer text for RTL support
  const formatTimerText = (time: string) => {
    if (isArabic) {
      // Convert Western Arabic numerals to Arabic-Indic numerals
      const arabicNumerals = time.replace(/[0-9]/g, digit => {
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return arabicDigits[parseInt(digit)];
      });
      return arabicNumerals;
    }
    return time;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.outerContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScreenHeader
            leftIcon={backIcon}
            renderCenter={() => (
              <AppText style={styles.header}>{t('Signin.heading')}</AppText>
            )}
          />
          <View style={styles.section}>
            <View style={styles.imageSection}>
              <Image style={styles.image} source={mail} resizeMode="contain" />
            </View>
            <AppText style={styles.heading}>{t('Signin.subheading')}</AppText>
            <AppText style={styles.text}>{t('Signin.message')}</AppText>
            <OtpInputField
              length={4}
              onOtpChange={handleOtpChange}
              autoFocus={shouldAutoFocus}
            />
            {isError ? (
              <ErrorMessage
                textStyles={styles.errorMessage}
                error={t('Signin.invalidOtp')}
              />
            ) : null}
            <Button
              disabled={!isOtpValid}
              title={t('Signin.button')}
              onPress={handleSubmit}
              style={styles.button}
            />
            <AppText style={styles.nototp}>
              {t('Signin.otpNotRecieved')}
            </AppText>
            <View
              style={[
                styles.timerContainer,
                isArabic && styles.timerContainerRTL,
              ]}>
              <AppText style={styles.resend}>{t('Signin.resend')}</AppText>
              <AppText style={[styles.resend, styles.timerText]}>
                {' '}
                - {formatTimerText('00:30')}
              </AppText>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingTop: topInset + scale(10),
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  header: {
    fontSize: scale(18),
    color: colors.textBlack,
    ...primaryFont('400'),
  },
  heading: {
    color: colors.textBlack,
    fontSize: scale(26),
    textAlign: 'center',
    paddingBottom: scale(10),
    paddingTop: scale(24),
    ...secondaryFont('600'),
  },
  section: {
    flex: 1,
    marginTop: scale(50),
  },
  imageSection: {
    height: scale(170),
    width: scale(170),
    borderRadius: scale(100),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.blue,
  },
  image: {
    height: scale(100),
    width: scale(100),
  },
  text: {
    fontSize: scale(16),
    color: colors.black,
    marginBottom: scale(60),
    ...primaryFont('400'),
    textAlign: 'center',
  },
  button: {
    marginTop: scale(60),
    marginBottom: scale(20),
    // backgroundColor: colors.deepBlue,
    // borderRadius: scale(12),
    // height: scale(56),
  },
  nototp: {
    textAlign: 'center',
    ...primaryFont('400'),
    fontSize: fontScale(14),
  },
  resend: {
    textAlign: 'center',
    ...primaryFont('500'),
    fontSize: fontScale(14.5),
    color: colors.blue,
    paddingTop: scale(5),
  },
  errorMessage: {
    fontSize: scale(18),
    marginTop: scale(10),
    textAlign: 'center',
    ...primaryFont('500'),
    marginBottom: scale(10),
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerContainerRTL: {
    flexDirection: 'row-reverse',
  },
  timerText: {
    color: colors.neutralDark,
  },
});
