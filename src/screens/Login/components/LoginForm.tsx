import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {scale, width} from '../../../utils';
import {colors, primaryFont, AUTH, secondaryFont} from '../../../constants';
import {AppText, Button, TextInputField} from '../../../components';
import {
  emailIcon,
  facebookIcon,
  faceid,
  fingerprint,
  googleIcon,
  lockIcon,
} from '../../../assets/images';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {formSchemaLogin, LoginFormValues} from '../helper';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../../apptypes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

interface LoginFormProps {
  onSubmit: (val: LoginFormValues, shouldEnableBiometric?: boolean) => void;
  submitInProgress: boolean;
  biometricAvailable: boolean;
  biometricType: string;
  biometricEnabled: boolean;
  onBiometricLogin: () => void;
  onGoogleLogin: () => void;
}

const LoginForm = ({
  onSubmit,
  submitInProgress,
  biometricType,
  onGoogleLogin,
  biometricEnabled,
  onBiometricLogin,
}: LoginFormProps) => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const {
    control,
    handleSubmit,
    formState: {isValid},
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(formSchemaLogin(t)),
    mode: 'onChange',
  });

  const handleLoginSubmit = (values: LoginFormValues) => {
    onSubmit(values, false);
  };

  const handleForgotPassword = () => {
    navigation.navigate(AUTH.FORGOT_PASSWORD);
  };

  const handleSignupPress = () => {
    navigation.navigate(AUTH.SIGNUP);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.formContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraKeyboardSpace={scale(50)}
      contentContainerStyle={styles.scrollContainer}>
      <View>
        <View style={styles.inputSection}>
          <View style={styles.headerContainer}>
            <AppText style={styles.heading}>{t('Login.heading')}</AppText>
            <AppText style={styles.subheading}>{t('Login.subheading')}</AppText>
          </View>
          <TextInputField
            control={control}
            name={'email'}
            labelKey="Login.emailLabel"
            keyboardType="email-address"
            placeholder={'Login.emailPlaceholder'}
            leftIcon={emailIcon}
            leftIconStyle={styles.iconStyle}
          />

          <TextInputField
            control={control}
            name={'password'}
            labelKey="Login.passwordLabel"
            isPassword
            placeholder={'Login.passwordPlaceholder'}
            leftIcon={lockIcon}
            leftIconStyle={styles.iconStyle}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.forgetPass}
            onPress={handleForgotPassword}>
            <AppText style={styles.forgetPassText}>
              {t('Login.forgetPassword')}
            </AppText>
          </TouchableOpacity>
        </View>

        {biometricEnabled && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={onBiometricLogin}
            disabled={submitInProgress}>
            <Image
              source={Platform.OS == 'android' ? fingerprint : faceid}
              style={{height: scale(42)}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        <Button
          disabled={!isValid || submitInProgress}
          style={styles.button}
          loader={submitInProgress}
          title={'Login.buttonText'}
          onPress={handleSubmit(handleLoginSubmit)}
        />

        <View style={styles.orTextContainer}>
          <View style={styles.orTextLine} />
          <AppText style={styles.orText}>{t('Login.orLoginWith')}</AppText>
          <View style={styles.orTextLine} />
        </View>
        <View style={styles.socialContainer}>
          <Button
            leftIcon={googleIcon}
            style={styles.socialButton}
            title={'Login.google'}
            titleStyle={styles.socialButtonText}
            onPress={onGoogleLogin}
          />
          <Button
            leftIcon={facebookIcon}
            style={styles.socialButton}
            title={'Login.facebook'}
            titleStyle={styles.socialButtonText}
          />
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
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  formContainer: {
    // paddingHorizontal: scale(20),
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
  },
  inputSection: {
    marginTop: scale(30),
  },
  headerContainer: {
    gap: scale(8),
    paddingBottom: scale(26),
  },
  heading: {
    color: colors.textBlack,
    fontSize: scale(32),
    textAlign: 'left',
    ...secondaryFont('500'),
  },
  subheading: {
    color: colors.neutralDark,
    fontSize: scale(16),
    textAlign: 'left',
    ...primaryFont('400'),
  },
  inputLabel: {
    fontSize: scale(16),
    color: colors.neutralDark,
    ...primaryFont('400'),
    marginBottom: scale(8),
    marginTop: scale(16),
  },
  inputStyles: {
    borderRadius: scale(12),
    height: scale(56),
  },
  iconStyle: {
    height: scale(20),
    width: scale(20),
  },
  forgetPass: {
    alignSelf: 'flex-end',
    marginVertical: scale(15),
  },
  forgetPassText: {
    color: colors.deepBlue,
    fontSize: scale(15),
    ...primaryFont('400'),
  },
  button: {
    marginTop: scale(30),
    marginBottom: scale(20),
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
    width: width * 0.36,
    height: 1,
  },
  socialContainer: {
    justifyContent: 'center',
    gap: scale(12),
    marginBottom: scale(30),
  },
  socialButton: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
  },
  socialButtonText: {
    color: colors.textBlack,
  },
  TxtContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(50),
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
  biometricButton: {
    marginTop: scale(20),
    marginBottom: scale(10),
    backgroundColor: colors.white,
    borderRadius: scale(12),
    height: scale(42),
    width: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
