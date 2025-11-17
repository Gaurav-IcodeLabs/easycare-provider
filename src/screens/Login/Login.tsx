import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import LoginForm from './components/LoginForm';
import {LoginFormValues} from './helper';
import {colors} from '../../constants';
import {GradientWrapper} from '../../components';
import {
  authenticateWithBiometrics,
  enableBiometricLogin,
  getBiometryTypeName,
  isBiometricAvailable,
  isBiometricEnabled,
  scale,
  useToast,
} from '../../utils';
import {logo} from '../../assets';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {login, loginInProgressSelector} from '../../slices/auth.slice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useLanguage} from '../../hooks';
import {
  biometricAvailableSelector,
  biometricEnabledSelector,
  biometricTypeSelector,
  updateAppState,
} from '../../slices/app.slice';

export const Login: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {top} = useSafeAreaInsets();
  const loginInProgress = useTypedSelector(loginInProgressSelector);
  const biometricAvailable = useTypedSelector(biometricAvailableSelector);
  console.log('biometricAvailable', biometricAvailable);
  const biometricType = useTypedSelector(biometricTypeSelector);
  const biometricEnabled = useTypedSelector(biometricEnabledSelector);
  const {showToast} = useToast();
  const {isArabic} = useLanguage();

  useEffect(() => {
    checkBiometricAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBiometricAvailability = async () => {
    const {available, biometryType} = await isBiometricAvailable();
    dispatch(updateAppState({key: 'biometricAvailable', value: available}));
    dispatch(
      updateAppState({
        key: 'biometricType',
        value: getBiometryTypeName(biometryType),
      }),
    );

    if (available) {
      const enabled = await isBiometricEnabled();
      console.log('enabled', enabled);
      dispatch(updateAppState({key: 'biometricEnabled', value: enabled}));
    }
  };

  const handleLogin = async (
    values: LoginFormValues,
    shouldEnableBiometric: boolean = false,
  ) => {
    try {
      await dispatch(
        login({
          username: values.email,
          password: values.password,
        }),
      ).unwrap();

      if (shouldEnableBiometric && biometricAvailable) {
        await enableBiometricLogin({
          username: values.email,
          password: values.password,
        });
        dispatch(updateAppState({key: 'biometricEnabled', value: true}));
      }

      // Login successful - navigation will be handled by auth state change
      showToast({
        type: 'success',
        title: t('Login.successTitle'),
        message: t('Login.successMessage'),
      });
    } catch (error: any) {
      const statusCode = error?.statusCode;
      let errorMessage = error?.message || t('Login.errorDefault');

      // Handle specific status codes
      if (statusCode === 401) {
        errorMessage = t('Login.errorInvalidCredentials');
      } else if (statusCode === 403) {
        errorMessage = t('Login.errorAccountDisabled');
      } else if (statusCode === 429) {
        errorMessage = t('Login.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('Login.errorTitle'),
        message: errorMessage,
      });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const promptKey = biometricType
        ? 'Login.biometricPromptWithType'
        : 'Login.biometricPrompt';
      const credentials = await authenticateWithBiometrics(
        t(promptKey, {type: biometricType}),
      );

      if (credentials) {
        await dispatch(
          login({
            username: credentials.username,
            password: credentials.password,
          }),
        ).unwrap();

        showToast({
          type: 'success',
          title: t('Login.successTitle'),
          message: t('Login.successMessage'),
        });
      }
    } catch (error: any) {
      const statusCode = error?.statusCode;
      let errorMessage = error?.message || t('Login.errorDefault');

      if (statusCode === 401) {
        errorMessage = t('Login.errorInvalidCredentials');
      } else if (statusCode === 403) {
        errorMessage = t('Login.errorAccountDisabled');
      } else if (statusCode === 429) {
        errorMessage = t('Login.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('Login.errorTitle'),
        message: errorMessage,
      });
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
      <LoginForm
        onSubmit={handleLogin}
        submitInProgress={loginInProgress}
        biometricAvailable={biometricAvailable}
        biometricType={biometricType}
        biometricEnabled={biometricEnabled}
        onBiometricLogin={handleBiometricLogin}
      />
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
});
