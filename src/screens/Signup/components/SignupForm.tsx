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
import {
  Button,
  CheckBox,
  AppText,
  BottomSheetTextInputField,
  PhoneInputField,
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
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../../apptypes';

interface SignupFormProps {
  onSubmit: (val: SignupFormValues) => void;
  submitInProgress: boolean;
  onDismissKeyboard: () => void;
}

const SignupForm = ({
  onSubmit,
  submitInProgress,
  onDismissKeyboard,
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
              <AppText style={styles.heading}>{t('Signup.heading')}</AppText>
              <AppText style={styles.subheading}>
                {t('Signup.subheading')}
              </AppText>
            </View>

            <BottomSheetTextInputField
              control={control}
              name={'firstName'}
              labelKey="Signup.firstNameLabel"
              placeholder={'Signup.firstNamePlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
            />
            <BottomSheetTextInputField
              control={control}
              name={'lastName'}
              labelKey="Signup.lastNameLabel"
              placeholder={'Signup.lastNamePlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
            />
            <BottomSheetTextInputField
              control={control}
              name={'fullName'}
              labelKey="Signup.fullNameLabel"
              placeholder={'Signup.fullNamePlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
            />

            <BottomSheetTextInputField
              control={control}
              name={'email'}
              labelKey="Signup.emailLabel"
              keyboardType="email-address"
              placeholder={'Signup.emailPlaceholder'}
              leftIcon={emailIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
            />

            <PhoneInputField
              control={control}
              name={'phoneNumber'}
              insideBottomSheet
              setError={setError}
              clearErrors={clearErrors}
              labelKey="Signup.phoneLabel"
              inputContainerStyles={styles.inputStyles}
            />

            <BottomSheetTextInputField
              control={control}
              name={'password'}
              labelKey="Signup.passwordLabel"
              isPassword
              placeholder={'Signup.passwordPlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              inputContainerStyles={styles.inputStyles}
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
            <TouchableOpacity style={styles.socialButton}>
              <Image source={googleIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={facebookIcon} />
            </TouchableOpacity>
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
      </TouchableWithoutFeedback>
    </BottomSheetScrollView>
  );
};

export default SignupForm;

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
  inputStyles: {
    borderRadius: scale(12),
    height: scale(56),
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
    ...primaryFont('400'),
    marginLeft: scale(8),
    flex: 1,
  },
  termsLink: {
    color: colors.deepBlue,
    ...primaryFont('600'),
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
  loginTxt: {
    fontSize: scale(14),
    color: colors.deepBlue,
    ...primaryFont('600'),
  },
});
