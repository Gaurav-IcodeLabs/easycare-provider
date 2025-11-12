import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as React from 'react';
import {useEffect} from 'react';
import {bottomInset, height, scale, width} from '../../../utils';
import {colors, primaryFont} from '../../../constants';
import {
  AppText,
  Button,
  GradientWrapper,
  TextInputField,
} from '../../../components';
import {
  emailIcon,
  facebookIcon,
  googleIcon,
  logo,
  smartphone,
} from '../../../assets/images';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {formSchemaPhoneLogin, PhoneLoginFormValues} from '../helper';
import {zodResolver} from '@hookform/resolvers/zod';

interface LoginFormByPhoneNumberProps {
  onSubmit: (val: PhoneLoginFormValues) => void;
  submitInProgress: boolean;
  onSwitchToEmail: () => void;
  onNavigateToSignup: () => void;
}

const LoginFormByPhoneNumber = ({
  onSubmit,
  submitInProgress,
  onSwitchToEmail,
  onNavigateToSignup,
}: LoginFormByPhoneNumberProps) => {
  const {t} = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: {isValid},
  } = useForm<PhoneLoginFormValues>({
    defaultValues: {
      phoneNumber: '',
    },
    resolver: zodResolver(formSchemaPhoneLogin(t)),
    mode: 'onChange',
  });

  const handleSignupPress = () => {
    onNavigateToSignup();
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
        extraKeyboardSpace={scale(50)}
        contentContainerStyle={styles.scrollContainer}>
        <GradientWrapper
          style={styles.topSection}
          children={<Image style={styles.appIcon} source={logo} />}
        />

        <View style={styles.formContainer}>
          <View style={styles.inputSection}>
            <View
              style={{
                alignItems: 'center',
                gap: scale(8),
                paddingBottom: scale(26),
              }}>
              <AppText
                style={{
                  color: colors.deepBlue,
                  fontSize: scale(26),
                  ...primaryFont('700'),
                }}>
                {t('Login.heading')}
              </AppText>
              <AppText
                style={{
                  color: colors.neutralDark,
                  fontSize: scale(16),
                  ...primaryFont('400'),
                  textAlign: 'center',
                }}>
                {t('Login.subheading')}
              </AppText>
            </View>

            <TextInputField
              control={control}
              name={'phoneNumber'}
              labelKey="Login.phoneLabel"
              keyboardType="phone-pad"
              placeholder={'Login.phonePlaceholder'}
              leftIcon={smartphone}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
            />
          </View>

          <Button
            disabled={!isValid || submitInProgress}
            style={styles.button}
            loader={submitInProgress}
            title={'Login.sendOTP'}
            onPress={handleSubmit(onSubmit)}
          />

          <View style={styles.orTextContainer}>
            <View style={styles.orTextLine} />
            <AppText style={styles.orText}>{t('Login.orLoginWith')}</AppText>
            <View style={styles.orTextLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={googleIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={facebookIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={onSwitchToEmail}>
              <Image source={emailIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.TxtContainer}>
            <AppText style={styles.dontTxt}>
              {t('Login.dontHaveAccount')}{' '}
            </AppText>
            <TouchableOpacity onPress={handleSignupPress}>
              <AppText style={styles.signupTxt}>{t('Login.signUp')}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default LoginFormByPhoneNumber;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  formContainer: {
    marginTop: -height * 0.05,
    backgroundColor: colors.white,
    paddingHorizontal: scale(20),
    borderTopRightRadius: scale(40),
    borderTopLeftRadius: scale(40),
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: bottomInset + scale(20),
  },
  appIcon: {
    height: scale(120),
    width: scale(96),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  topSection: {
    width: width * 1.5,
    height: height / 3,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginTop: scale(30),
  },
  inputStyles: {
    borderRadius: scale(12),
    height: scale(56),
  },
  iconStyle: {
    height: scale(20),
    width: scale(20),
  },
  button: {
    marginTop: scale(30),
    marginBottom: scale(20),
    backgroundColor: colors.deepBlue,
    borderRadius: scale(12),
    height: scale(56),
  },
  orTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  orText: {
    textAlign: 'center',
    fontSize: scale(14.2),
    color: colors.grey,
    ...primaryFont('400'),
    marginVertical: scale(20),
  },
  orTextLine: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    width: width * 0.3,
    height: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(16),
    marginBottom: scale(30),
  },
  socialButton: {
    width: scale(90),
    height: scale(48),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  TxtContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  dontTxt: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
  },
  signupTxt: {
    fontSize: scale(14),
    color: colors.deepBlue,
    ...primaryFont('600'),
  },
});
