import React, {useRef, useMemo} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {useTranslation} from 'react-i18next';
import LoginForm from './components/LoginForm';
import {LoginFormValues} from './helper';
import {colors} from '../../constants';
import {GradientWrapper} from '../../components';
import {scale, useToast} from '../../utils';
import {logo} from '../../assets';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {login, loginInProgressSelector} from '../../slices/auth.slice';

export const Login: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const loginInProgress = useTypedSelector(loginInProgressSelector);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const {showToast} = useToast();

  const snapPoints = useMemo(() => ['75%', '75%'], []);

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

  const handleDismissKeyboard = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  return (
    <View style={styles.container}>
      <GradientWrapper
        colors={[colors.deepBlue, colors.blue, colors.white, colors.white]}>
        <View style={styles.topSection}>
          <Image source={logo} style={styles.appIcon} />
        </View>
      </GradientWrapper>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableContentPanningGesture={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize">
        <LoginForm
          onSubmit={handleLogin}
          submitInProgress={loginInProgress}
          onDismissKeyboard={handleDismissKeyboard}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appIcon: {
    height: scale(120),
    width: scale(96),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  topSection: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: scale(40),
    borderTopRightRadius: scale(40),
  },
  handleIndicator: {
    display: 'none',
  },
});
