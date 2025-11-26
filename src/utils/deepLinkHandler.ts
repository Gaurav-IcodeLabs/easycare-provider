import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';
import {store} from '../sharetribeSetup';
import {verifyEmail} from '../slices/auth.slice';
import i18n from '../locales';
import {navigationRef} from '../navigators/RootNavigator';
import {AUTH} from '../constants';

export const parseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      pathname: urlObj.pathname,
      params,
    };
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

export const handleDeepLinkUrl = (url: string): void => {
  const parsed = parseUrl(url);

  if (!parsed) {
    console.warn('Failed to parse deep link URL:', url);
    return;
  }

  const {pathname, params} = parsed;

  // Handle email verification
  if (pathname.includes('/verify-email')) {
    handleEmailVerification(params);
    return;
  }

  // Handle password reset
  if (pathname.includes('/reset-password')) {
    handlePasswordReset(params);
    return;
  }

  // Add more route handlers here
  console.warn('Unhandled deep link:', url);
};

const handleEmailVerification = (params: Record<string, string>): void => {
  const token = params.t;

  if (!token) {
    console.error('Email verification token missing in deep link');
    Toast.show({
      type: 'error',
      text1: i18n.t('DeepLink.verificationFailedTitle'),
      text2: i18n.t('DeepLink.invalidVerificationLink'),
    });
    return;
  }

  // Check if user is authenticated
  const state = store.getState();
  const isAuthenticated = state.auth?.isAuthenticated;

  if (!isAuthenticated) {
    Toast.show({
      type: 'info',
      text1: i18n.t('DeepLink.pleaseLoginTitle'),
      text2: i18n.t('DeepLink.pleaseLoginMessage'),
      visibilityTime: 5000,
    });
    // Store token for later use after login
    // You could store this in AsyncStorage or Redux if needed
    return;
  }

  store
    .dispatch(verifyEmail({verificationToken: token}))
    .unwrap()
    .then(() => {
      Toast.show({
        type: 'success',
        text1: i18n.t('DeepLink.emailVerifiedTitle'),
        text2: i18n.t('DeepLink.emailVerifiedMessage'),
      });
    })
    .catch((error: any) => {
      const errorMessage =
        error?.message || i18n.t('DeepLink.verificationFailedDefault');
      Toast.show({
        type: 'error',
        text1: i18n.t('DeepLink.verificationFailedTitle'),
        text2: errorMessage,
      });
    });
};

const handlePasswordReset = (params: Record<string, string>): void => {
  const token = params.t;
  const email = params.e;

  if (!token || !email) {
    console.error('Password reset token or email missing in deep link');
    Toast.show({
      type: 'error',
      text1: i18n.t('DeepLink.passwordResetFailedTitle'),
      text2: i18n.t('DeepLink.invalidPasswordResetLink'),
    });
    return;
  }

  // Navigate to NewPassword screen with token and email
  if (navigationRef.isReady()) {
    navigationRef.navigate(AUTH.NEW_PASSWORD as any, {
      email: decodeURIComponent(email),
      token,
    });
  } else {
    // If navigation is not ready, wait a bit and try again
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(AUTH.NEW_PASSWORD as any, {
          email: decodeURIComponent(email),
          token,
        });
      }
    }, 500);
  }
};
