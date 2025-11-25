import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {scale, width} from '../../../utils';
import {colors, primaryFont, AUTH, secondaryFont} from '../../../constants';
import {
  Button,
  CheckBox,
  AppText,
  PhoneInputField,
  TextInputField,
} from '../../../components';
import {
  emailIcon,
  facebookIcon,
  googleIcon,
  lockIcon,
} from '../../../assets/images';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {formSchemaSignup, SignupFormValues} from '../helper';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../../apptypes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

interface SignupFormProps {
  onSubmit: (val: SignupFormValues) => void;
  submitInProgress: boolean;
  onGoogleSignup?: () => void;
}

const SignupForm = ({
  onSubmit,
  submitInProgress,
  onGoogleSignup,
}: SignupFormProps) => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: {isValid},
  } = useForm<SignupFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      agreeToTerms: false,
    },
    resolver: zodResolver(formSchemaSignup(t)),
    mode: 'onChange',
  });

  const handleLoginPress = () => {
    navigation.navigate(AUTH.LOGIN);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.formContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}>
      <View>
        <View style={styles.inputSection}>
          <View style={styles.headerContainer}>
            <AppText style={styles.heading}>{t('Signup.heading')}</AppText>
            <AppText style={styles.subheading}>
              {t('Signup.subheading')}
            </AppText>
          </View>

          <TextInputField
            control={control}
            name={'firstName'}
            labelKey="Signup.firstNameLabel"
            placeholder={'Signup.firstNamePlaceholder'}
            leftIcon={lockIcon}
            leftIconStyle={styles.iconStyle}
          />
          <TextInputField
            control={control}
            name={'lastName'}
            labelKey="Signup.lastNameLabel"
            placeholder={'Signup.lastNamePlaceholder'}
            leftIcon={lockIcon}
            leftIconStyle={styles.iconStyle}
          />
          <TextInputField
            control={control}
            name={'fullName'}
            labelKey="Signup.fullNameLabel"
            placeholder={'Signup.fullNamePlaceholder'}
            leftIcon={lockIcon}
            leftIconStyle={styles.iconStyle}
          />

          <TextInputField
            control={control}
            name={'email'}
            labelKey="Signup.emailLabel"
            keyboardType="email-address"
            placeholder={'Signup.emailPlaceholder'}
            leftIcon={emailIcon}
            leftIconStyle={styles.iconStyle}
          />

          <PhoneInputField
            control={control}
            name={'phoneNumber'}
            setError={setError}
            clearErrors={clearErrors}
            labelKey="Signup.phoneLabel"
            placeholderKey="Signup.phoneLabel"
          />

          <TextInputField
            control={control}
            name={'password'}
            labelKey="Signup.passwordLabel"
            isPassword
            placeholder={'Signup.passwordPlaceholder'}
            leftIcon={lockIcon}
            autoCapitalize="none"
          />

          <View style={styles.checkboxContainer}>
            <CheckBox control={control} name={'agreeToTerms'} />
            <AppText style={styles.termsText}>
              {t('Signup.agreeToTerms')}
              <AppText style={styles.termsLink}>
                {' '}
                {t('Signup.termsAndConditions')}
              </AppText>
            </AppText>
          </View>
        </View>

        <Button
          disabled={!isValid || submitInProgress}
          style={styles.button}
          loader={submitInProgress}
          title={'Signup.buttonText'}
          onPress={handleSubmit(onSubmit)}
        />

        <View style={styles.orTextContainer}>
          <View style={styles.orTextLine} />
          <AppText style={styles.orText}>{t('Signup.orSignupWith')}</AppText>
          <View style={styles.orTextLine} />
        </View>

        <View style={styles.socialContainer}>
          <Button
            leftIcon={googleIcon}
            style={styles.socialButton}
            title={'Login.google'}
            titleStyle={styles.socialButtonText}
            onPress={onGoogleSignup}
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
            {t('Signup.alreadyHaveAccount')}{' '}
          </AppText>
          <TouchableOpacity onPress={handleLoginPress}>
            <AppText style={styles.loginTxt}>{t('Signup.login')}</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default SignupForm;

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
  iconStyle: {
    height: scale(20),
    width: scale(20),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(16),
    paddingHorizontal: scale(4),
  },
  termsText: {
    fontSize: scale(14),
    color: colors.neutralDark,
    marginLeft: scale(8),
    flex: 1,
    textAlign: 'left',
    ...primaryFont('400'),
  },
  termsLink: {
    color: colors.deepBlue,
    ...primaryFont('600'),
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
    width: width * 0.3,
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
  loginTxt: {
    fontSize: scale(14),
    color: colors.deepBlue,
    ...primaryFont('600'),
  },
});
