import React, {useEffect} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import LoginForm from './components/LoginForm';
import {LoginFormValues} from './helper';
import {colors} from '../../constants';

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
import {
  login,
  loginInProgressSelector,
  loginWithIdp,
} from '../../slices/auth.slice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  biometricAvailableSelector,
  biometricEnabledSelector,
  biometricTypeSelector,
  updateAppState,
} from '../../slices/app.slice';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithFacebook,
} from '../../utils/socialAuth.helpers';
import {getEmailWithPhoneNumber} from '../../utils/api';

export const Login: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {top} = useSafeAreaInsets();
  const loginInProgress = useTypedSelector(loginInProgressSelector);
  const biometricAvailable = useTypedSelector(biometricAvailableSelector);
  const biometricType = useTypedSelector(biometricTypeSelector);
  const biometricEnabled = useTypedSelector(biometricEnabledSelector);
  const {showToast} = useToast();

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
          username: values.phoneNumber,
          password: values.password,
        }),
      ).unwrap();

      if (shouldEnableBiometric && biometricAvailable) {
        // Get email for biometric storage
        const emailResponse = await getEmailWithPhoneNumber({
          phoneNumber: values.phoneNumber,
        });
        const email = (emailResponse as any)?.email;

        if (email) {
          await enableBiometricLogin({
            username: email,
            password: values.password,
          });
          dispatch(updateAppState({key: 'biometricEnabled', value: true}));
        }
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
      } else if (statusCode === 404) {
        errorMessage = t('Login.errorPhoneNotFound');
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

  const handleGoogleLogin = async () => {
    try {
      const userInfo = await signInWithGoogle();
      console.log('userInfo', userInfo);

      const {idpToken, idpClientId, idpId} = userInfo ?? {};

      await dispatch(
        loginWithIdp({
          idpToken,
          idpClientId,
          idpId,
        }),
      ).unwrap();

      showToast({
        type: 'success',
        title: t('Login.successTitle'),
        message: t('Login.successMessage'),
      });
    } catch (error: any) {
      // Debug: Log the full error structure
      console.log('Google Login Error:', JSON.stringify(error, null, 2));

      const statusCode = error?.statusCode;
      const errorCode = error?.code;
      let errorMessage = t('Login.errorDefault');

      // Handle specific status codes
      if (statusCode === 401) {
        errorMessage = t('Login.errorInvalidCredentials');
      } else if (statusCode === 403) {
        if (errorCode === 'forbidden') {
          errorMessage = t('Login.errorIdpValidation');
        } else {
          errorMessage = t('Login.errorAccountDisabled');
        }
      } else if (statusCode === 404) {
        errorMessage = t('Login.errorAccountNotFound');
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

  const handleAppleLogin = async () => {
    try {
      const userInfo = await signInWithApple();
      console.log('Apple userInfo', userInfo);

      const {idpToken, idpClientId, idpId} = userInfo ?? {};

      await dispatch(
        loginWithIdp({
          idpToken,
          idpClientId,
          idpId,
        }),
      ).unwrap();

      showToast({
        type: 'success',
        title: t('Login.successTitle'),
        message: t('Login.successMessage'),
      });
    } catch (error: any) {
      console.log('Apple Login Error:', JSON.stringify(error, null, 2));

      const statusCode = error?.statusCode;
      const errorCode = error?.code;
      let errorMessage = t('Login.errorDefault');

      if (statusCode === 401) {
        errorMessage = t('Login.errorInvalidCredentials');
      } else if (statusCode === 403) {
        if (errorCode === 'forbidden') {
          errorMessage = t('Login.errorIdpValidation');
        } else {
          errorMessage = t('Login.errorAccountDisabled');
        }
      } else if (statusCode === 404) {
        errorMessage = t('Login.errorAccountNotFound');
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

  const handleFacebookLogin = async () => {
    try {
      const userInfo = await signInWithFacebook();

      const {idpToken, idpClientId, idpId} = userInfo ?? {};

      await dispatch(
        loginWithIdp({
          idpToken,
          idpClientId,
          idpId,
        }),
      ).unwrap();

      showToast({
        type: 'success',
        title: t('Login.successTitle'),
        message: t('Login.successMessage'),
      });
    } catch (error: any) {
      console.log('Facebook Login Error:', JSON.stringify(error, null, 2));

      const statusCode = error?.statusCode;
      const errorCode = error?.code;
      let errorMessage = t('Login.errorDefault');

      if (statusCode === 401) {
        errorMessage = t('Login.errorInvalidCredentials');
      } else if (statusCode === 403) {
        if (errorCode === 'forbidden') {
          errorMessage = t('Login.errorIdpValidation');
        } else {
          errorMessage = t('Login.errorAccountDisabled');
        }
      } else if (statusCode === 404) {
        errorMessage = t('Login.errorAccountNotFound');
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
        <Image source={logo} style={styles.appIcon} />
      </View>
      <LoginForm
        onSubmit={handleLogin}
        submitInProgress={loginInProgress}
        biometricAvailable={biometricAvailable}
        biometricType={biometricType}
        biometricEnabled={biometricEnabled}
        onBiometricLogin={handleBiometricLogin}
        onGoogleLogin={handleGoogleLogin}
        onAppleLogin={handleAppleLogin}
        onFacebookLogin={handleFacebookLogin}
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
