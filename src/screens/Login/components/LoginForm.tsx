import React from 'react';
import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {bottomInset, scale, width} from '../../../utils';
import {colors, primaryFont, AUTH, secondaryFont} from '../../../constants';
import {AppText, Button, BottomSheetTextInputField} from '../../../components';
import {
  emailIcon,
  facebookIcon,
  googleIcon,
  lockIcon,
} from '../../../assets/images';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {formSchemaLogin, LoginFormValues} from '../helper';
import {zodResolver} from '@hookform/resolvers/zod';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../../apptypes';

interface LoginFormProps {
  onSubmit: (val: LoginFormValues) => void;
  submitInProgress: boolean;
  onDismissKeyboard: () => void;
}

const LoginForm = ({
  onSubmit,
  submitInProgress,
  onDismissKeyboard,
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

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen when implemented
    console.log('Navigate to forgot password');
  };

  const handleSignupPress = () => {
    navigation.navigate(AUTH.SIGNUP);
  };

  const handleDismiss = () => {
    Keyboard.dismiss();
    onDismissKeyboard();
  };

  return (
    <BottomSheetScrollView
      style={styles.formContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContainer,
        {paddingBottom: bottomInset + scale(100)},
      ]}>
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={{paddingBottom: scale(20)}}>
          <View style={styles.inputSection}>
            <View style={styles.headerContainer}>
              <AppText style={styles.heading}>{t('Login.heading')}</AppText>
              <AppText style={styles.subheading}>
                {t('Login.subheading')}
              </AppText>
            </View>
            <BottomSheetTextInputField
              control={control}
              name={'email'}
              labelKey="Login.emailLabel"
              keyboardType="email-address"
              placeholder={'Login.emailPlaceholder'}
              leftIcon={emailIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
            />

            <BottomSheetTextInputField
              control={control}
              name={'password'}
              labelKey="Login.passwordLabel"
              isPassword
              placeholder={'Login.passwordPlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
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

          <Button
            disabled={!isValid || submitInProgress}
            style={styles.button}
            loader={submitInProgress}
            title={'Login.buttonText'}
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
      </TouchableWithoutFeedback>
    </BottomSheetScrollView>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: scale(20),
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inputSection: {
    marginTop: scale(30),
  },
  headerContainer: {
    alignItems: 'center',
    gap: scale(8),
    paddingBottom: scale(26),
  },
  heading: {
    color: colors.deepBlue,
    fontSize: scale(26),
    ...secondaryFont('700'),
  },
  subheading: {
    color: colors.neutralDark,
    fontSize: scale(16),
    ...primaryFont('400'),
    textAlign: 'center',
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
    color: colors.neutralDark,
    fontSize: scale(15),
    ...primaryFont('400'),
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
    marginBottom: scale(100),
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
