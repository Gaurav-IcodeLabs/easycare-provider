import React, {useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {scale, useToast} from '../../utils';
import {AppText, Button, TextInputField} from '../../components';
import {vaultIcon} from '../../assets/images';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<NewPasswordRouteProp>();
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const {showToast} = useToast();
  const {top, bottom} = useSafeAreaInsets();

  const {email, token} = route.params ?? {email: '', token: ''};

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

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, {paddingTop: top, paddingBottom: bottom}]}>
      <KeyboardAwareScrollView
        style={styles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enabled
        bottomOffset={scale(bottom)}
        contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Image source={vaultIcon} style={styles.vaultIcon} />
            </View>
          </View>

          <View style={styles.headerContainer}>
            <AppText style={styles.heading}>{t('NewPassword.heading')}</AppText>
            <AppText style={styles.subheading}>
              {t('NewPassword.subheading')}
            </AppText>
          </View>

          <View style={styles.inputSection}>
            <TextInputField
              control={control}
              name={'password'}
              labelKey="NewPassword.passwordLabel"
              isPassword
              placeholder={'NewPassword.passwordPlaceholder'}
              autoCapitalize="none"
            />

            <TextInputField
              control={control}
              name={'confirmPassword'}
              labelKey="NewPassword.confirmPasswordLabel"
              isPassword
              placeholder={'NewPassword.confirmPasswordPlaceholder'}
              autoCapitalize="none"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <Button
        disabled={!isValid || submitInProgress}
        style={styles.button}
        loader={submitInProgress}
        title={'NewPassword.buttonText'}
        onPress={handleSubmit(handleNewPasswordSubmit)}
      />
      <View style={styles.backToLoginContainer}>
        <TouchableOpacity onPress={handleBackToLogin}>
          <AppText style={styles.loginText}>
            {t('ForgotPassword.backToLogin')}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: scale(20),
  },
  formContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: scale(60),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: scale(32),
  },
  iconCircle: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultIcon: {
    width: scale(60),
    height: scale(60),
    resizeMode: 'contain',
  },
  headerContainer: {
    gap: scale(8),
    marginBottom: scale(32),
    alignItems: 'center',
  },
  heading: {
    color: colors.textBlack,
    fontSize: scale(24),
    textAlign: 'center',
    ...secondaryFont('600'),
  },
  subheading: {
    color: colors.neutralDark,
    fontSize: scale(14),
    textAlign: 'center',
    ...primaryFont('400'),
  },
  inputSection: {
    gap: scale(16),
  },
  button: {
    marginTop: scale(32),
    marginBottom: scale(20),
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
  },
  loginText: {
    fontSize: scale(14),
    color: colors.blue,
    ...primaryFont('600'),
  },
});
