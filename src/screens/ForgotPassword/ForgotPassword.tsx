import React, {useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {colors, primaryFont, secondaryFont} from '../../constants';
import {logo} from '../../assets';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useLanguage} from '../../hooks';
import {scale, useToast} from '../../utils';
import {AppText, Button, TextInputField} from '../../components';
import {emailIcon} from '../../assets/images';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../apptypes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {sdk} from '../../sharetribeSetup';
import {z} from 'zod';

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
  const {top} = useSafeAreaInsets();
  const {isArabic} = useLanguage();
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
                {t('ForgotPassword.heading')}
              </AppText>
              <AppText style={styles.subheading}>
                {t('ForgotPassword.subheading')}
              </AppText>
            </View>

            <TextInputField
              control={control}
              name={'email'}
              labelKey="ForgotPassword.emailLabel"
              keyboardType="email-address"
              placeholder={'ForgotPassword.emailPlaceholder'}
              leftIcon={emailIcon}
              leftIconStyle={styles.iconStyle}
            />
          </View>

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
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(20),
  },
  backToLoginText: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('400'),
  },
  loginText: {
    fontSize: scale(14),
    color: colors.deepBlue,
    ...primaryFont('600'),
  },
});
