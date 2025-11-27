import React, {useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {scale, useToast} from '../../utils';
import {AppText, Button, TextInputField} from '../../components';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../apptypes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {sdk} from '../../sharetribeSetup';
import {z} from 'zod';
import {locIcon} from '../../assets';

const formSchemaForgotPassword = (t: any) =>
  z.object({
    email: z
      .string()
      .min(1, {message: t('ForgotPassword.emailIsRequired')})
      .email({message: t('ForgotPassword.emailIsRequired')}),
  });

type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof formSchemaForgotPassword>
>;

export const ForgotPassword: React.FC = () => {
  const {t} = useTranslation();
  const {top, bottom} = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const {showToast} = useToast();

  const {
    control,
    handleSubmit,
    formState: {isValid},
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(formSchemaForgotPassword(t)),
    mode: 'onChange',
  });

  const handleForgotPasswordSubmit = async (
    values: ForgotPasswordFormValues,
  ) => {
    setSubmitInProgress(true);
    try {
      await sdk.passwordReset.request({
        email: values.email,
      });

      showToast({
        type: 'success',
        title: t('ForgotPassword.successTitle'),
        message: t('ForgotPassword.successMessage'),
      });

      // Navigate back to login after successful request
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      const statusCode = error?.statusCode;
      let errorMessage = error?.message || t('ForgotPassword.errorDefault');

      // Handle specific status codes
      if (statusCode === 404) {
        errorMessage = t('ForgotPassword.errorEmailNotFound');
      } else if (statusCode === 429) {
        errorMessage = t('ForgotPassword.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('ForgotPassword.errorTitle'),
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
            <Image source={locIcon} style={styles.lockIcon} />
          </View>

          <View style={styles.headerContainer}>
            <AppText style={styles.heading}>
              {t('ForgotPassword.heading')}
            </AppText>
            <AppText style={styles.subheading}>
              {t('ForgotPassword.subheading')}
            </AppText>
          </View>

          <View style={styles.inputSection}>
            <TextInputField
              control={control}
              name={'email'}
              labelKey="ForgotPassword.emailLabel"
              keyboardType="email-address"
              placeholder={'ForgotPassword.emailPlaceholder'}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Button
        disabled={!isValid || submitInProgress}
        style={styles.button}
        loader={submitInProgress}
        title={'ForgotPassword.buttonText'}
        onPress={handleSubmit(handleForgotPasswordSubmit)}
      />
      <View style={styles.backToLoginContainer}>
        <AppText style={styles.backToLoginText}>
          {t('ForgotPassword.rememberPassword')}{' '}
        </AppText>
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
    alignItems: 'center',
    paddingTop: scale(60),
  },
  iconContainer: {
    width: scale(160),
    height: scale(160),
    borderRadius: scale(80),
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(40),
  },
  lockIcon: {
    width: scale(80),
    height: scale(80),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  headerContainer: {
    alignItems: 'center',
    gap: scale(12),
    marginBottom: scale(40),
    paddingHorizontal: scale(20),
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
    lineHeight: scale(20),
  },
  inputSection: {
    width: '100%',
    marginBottom: scale(40),
  },
  button: {
    width: '100%',
    marginBottom: scale(20),
    backgroundColor: colors.blue,
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
