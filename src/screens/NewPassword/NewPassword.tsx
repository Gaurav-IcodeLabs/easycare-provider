import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {logo} from '../../assets';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useLanguage} from '../../hooks';
import {scale, useToast} from '../../utils';
import {AppText, Button, TextInputField} from '../../components';
import {lockIcon} from '../../assets/images';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../apptypes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {sdk} from '../../sharetribeSetup';
import {AUTH} from '../../constants';
import {z} from 'zod';

type NewPasswordRouteProp = RouteProp<
  AuthStackParamList,
  typeof AUTH.NEW_PASSWORD
>;

const formSchemaNewPassword = (t: any) =>
  z
    .object({
      password: z
        .string()
        .min(8, {message: t('NewPassword.passwordIsRequired')}),
      confirmPassword: z
        .string()
        .min(1, {message: t('NewPassword.confirmPasswordIsRequired')}),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('NewPassword.passwordsMustMatch'),
      path: ['confirmPassword'],
    });

type NewPasswordFormValues = z.infer<ReturnType<typeof formSchemaNewPassword>>;

export const NewPassword: React.FC = () => {
  const {t} = useTranslation();
  const {top} = useSafeAreaInsets();
  const {isArabic} = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<NewPasswordRouteProp>();
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const {showToast} = useToast();

  const {email, token} = route.params;

  const {
    control,
    handleSubmit,
    formState: {isValid},
  } = useForm<NewPasswordFormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(formSchemaNewPassword(t)),
    mode: 'onChange',
  });

  const handleNewPasswordSubmit = async (values: NewPasswordFormValues) => {
    setSubmitInProgress(true);
    try {
      await sdk.passwordReset.reset({
        email,
        passwordResetToken: token,
        newPassword: values.password,
      });

      showToast({
        type: 'success',
        title: t('NewPassword.successTitle'),
        message: t('NewPassword.successMessage'),
      });

      // Navigate to login after successful password reset
      setTimeout(() => {
        navigation.navigate(AUTH.LOGIN);
      }, 1500);
    } catch (error: any) {
      const statusCode = error?.statusCode;
      let errorMessage = error?.message || t('NewPassword.errorDefault');

      // Handle specific status codes
      if (statusCode === 400) {
        errorMessage = t('NewPassword.errorInvalidToken');
      } else if (statusCode === 404) {
        errorMessage = t('NewPassword.errorTokenExpired');
      } else if (statusCode === 429) {
        errorMessage = t('NewPassword.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('NewPassword.errorTitle'),
        message: errorMessage,
      });
    } finally {
      setSubmitInProgress(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, {paddingTop: top}]}>
        <Image
          source={logo}
          style={[styles.appIcon, isArabic && {transform: [{scaleX: -1}]}]}
        />
      </View>
      <KeyboardAwareScrollView
        style={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraKeyboardSpace={scale(50)}
        contentContainerStyle={styles.scrollContainer}>
        <View>
          <View style={styles.inputSection}>
            <View style={styles.headerContainer}>
              <AppText style={styles.heading}>
                {t('NewPassword.heading')}
              </AppText>
              <AppText style={styles.subheading}>
                {t('NewPassword.subheading')}
              </AppText>
            </View>

            <TextInputField
              control={control}
              name={'password'}
              labelKey="NewPassword.passwordLabel"
              isPassword
              placeholder={'NewPassword.passwordPlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              autoCapitalize="none"
            />

            <TextInputField
              control={control}
              name={'confirmPassword'}
              labelKey="NewPassword.confirmPasswordLabel"
              isPassword
              placeholder={'NewPassword.confirmPasswordPlaceholder'}
              leftIcon={lockIcon}
              leftIconStyle={styles.iconStyle}
              autoCapitalize="none"
            />
          </View>

          <Button
            disabled={!isValid || submitInProgress}
            style={styles.button}
            loader={submitInProgress}
            title={'NewPassword.buttonText'}
            onPress={handleSubmit(handleNewPasswordSubmit)}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  appIcon: {
    height: scale(40),
    width: scale(120),
    resizeMode: 'contain',
  },
  topSection: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  formContainer: {},
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
  button: {
    marginTop: scale(30),
    marginBottom: scale(20),
  },
});
