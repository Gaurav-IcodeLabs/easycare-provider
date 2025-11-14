import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import LoginForm from './components/LoginForm';
import {LoginFormValues} from './helper';
import {colors} from '../../constants';
import {GradientWrapper} from '../../components';
import {scale, useToast} from '../../utils';
import {logo} from '../../assets';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {login, loginInProgressSelector} from '../../slices/auth.slice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useLanguage} from '../../hooks';

export const Login: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {top} = useSafeAreaInsets();
  const loginInProgress = useTypedSelector(loginInProgressSelector);
  const {showToast} = useToast();
  const {isArabic} = useLanguage();

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await dispatch(
        login({
          username: values.email,
          password: values.password,
        }),
      ).unwrap();

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

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, {paddingTop: top}]}>
        <Image
          source={logo}
          style={[styles.appIcon, isArabic && {transform: [{scaleX: -1}]}]}
        />
      </View>
      <LoginForm onSubmit={handleLogin} submitInProgress={loginInProgress} />
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
