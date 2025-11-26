import 'react-native-url-polyfill/auto';
import Toast from 'react-native-toast-message';
import {store} from '../sharetribeSetup';
import {verifyEmail} from '../slices/auth.slice';
import i18n from '../locales';

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
