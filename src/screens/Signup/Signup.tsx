import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import SignupForm from './components/SignupForm';
import {colors} from '../../constants';
import {SignupParams} from '../../apptypes';
import {scale, useToast} from '../../utils';
import {logo} from '../../assets';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  signup,
  signUpInProgressSelector,
  signupWithIdp,
} from '../../slices/auth.slice';
import {SignupFormValues} from './helper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithFacebook,
} from '../../utils/socialAuth.helpers';

export const Signup: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const {top} = useSafeAreaInsets();
  const signupInProgress = useTypedSelector(signUpInProgressSelector);
  const {showToast} = useToast();

  const handleSignup = async (values: SignupFormValues) => {
    try {
      const signupParams: SignupParams = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        // displayName: values.fullName,
        protectedData: {
          phoneNumber: values.phoneNumber,
        },
      };

      await dispatch(signup(signupParams)).unwrap();

      // Signup successful - navigate to OTP verification
      showToast({
        type: 'success',
        title: t('Signup.successTitle'),
        message: t('Signup.successMessage'),
      });
    } catch (error: any) {
      const statusCode = error?.statusCode;
      let errorMessage = error?.message || t('Signup.errorDefault');

      // Handle specific status codes
      if (statusCode === 409) {
        errorMessage = error?.message || t('Signup.errorUserExists');
      } else if (statusCode === 400) {
        errorMessage = t('Signup.errorInvalidInfo');
      } else if (statusCode === 429) {
        errorMessage = t('Signup.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('Signup.errorTitle'),
        message: errorMessage,
      });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userInfo = await signInWithGoogle();
      await dispatch(signupWithIdp(userInfo)).unwrap();
      showToast({
        type: 'success',
        title: t('Signup.successTitle'),
        message: t('Signup.successMessage'),
      });
    } catch (error: any) {
      // Debug: Log the full error structure
      console.log('Google Signup Error:', JSON.stringify(error, null, 2));

      const statusCode = error?.statusCode;
      const errorCode = error?.code;
      let errorMessage = t('Signup.errorGoogleAuth');

      // Handle specific status codes
      if (statusCode === 403) {
        errorMessage = t('Signup.errorIdpValidation');
      } else if (statusCode === 409) {
        // Check for specific 409 error codes
        if (errorCode === 'idp-profile-already-exists') {
          errorMessage = t('Signup.errorIdpAlreadyLinked');
        } else if (errorCode === 'email-taken') {
          errorMessage = t('Signup.errorEmailExists');
        } else if (errorCode === 'conflict-missing-key') {
          errorMessage = t('Signup.errorMissingInfo');
        } else {
          errorMessage = t('Signup.errorUserExists');
        }
      } else if (statusCode === 400) {
        errorMessage = t('Signup.errorInvalidInfo');
      } else if (statusCode === 429) {
        errorMessage = t('Signup.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('Signup.errorTitle'),
        message: errorMessage,
      });
    }
  };

  const handleAppleSignup = async () => {
    try {
      const userInfo = await signInWithApple();
      await dispatch(signupWithIdp(userInfo)).unwrap();
      showToast({
        type: 'success',
        title: t('Signup.successTitle'),
        message: t('Signup.successMessage'),
      });
    } catch (error: any) {
      console.log('Apple Signup Error:', JSON.stringify(error, null, 2));

      const statusCode = error?.statusCode;
      const errorCode = error?.code;
      let errorMessage = t('Signup.errorGoogleAuth');

      if (statusCode === 403) {
        errorMessage = t('Signup.errorIdpValidation');
      } else if (statusCode === 409) {
        if (errorCode === 'idp-profile-already-exists') {
          errorMessage = t('Signup.errorIdpAlreadyLinked');
        } else if (errorCode === 'email-taken') {
          errorMessage = t('Signup.errorEmailExists');
        } else if (errorCode === 'conflict-missing-key') {
          errorMessage = t('Signup.errorMissingInfo');
        } else {
          errorMessage = t('Signup.errorUserExists');
        }
      } else if (statusCode === 400) {
        errorMessage = t('Signup.errorInvalidInfo');
      } else if (statusCode === 429) {
        errorMessage = t('Signup.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('Signup.errorTitle'),
        message: errorMessage,
      });
    }
  };

  const handleFacebookSignup = async () => {
    try {
      const userInfo = await signInWithFacebook();
      await dispatch(signupWithIdp(userInfo)).unwrap();
      showToast({
        type: 'success',
        title: t('Signup.successTitle'),
        message: t('Signup.successMessage'),
      });
    } catch (error: any) {
      console.log('Facebook Signup Error:', JSON.stringify(error, null, 2));

      const statusCode = error?.statusCode;
      const errorCode = error?.code;
      let errorMessage = t('Signup.errorFacebookAuth');

      if (statusCode === 403) {
        errorMessage = t('Signup.errorIdpValidation');
      } else if (statusCode === 409) {
        if (errorCode === 'idp-profile-already-exists') {
          errorMessage = t('Signup.errorIdpAlreadyLinked');
        } else if (errorCode === 'email-taken') {
          errorMessage = t('Signup.errorEmailExists');
        } else if (errorCode === 'conflict-missing-key') {
          errorMessage = t('Signup.errorMissingInfo');
        } else {
          errorMessage = t('Signup.errorUserExists');
        }
      } else if (statusCode === 400) {
        errorMessage = t('Signup.errorInvalidInfo');
      } else if (statusCode === 429) {
        errorMessage = t('Signup.errorTooManyAttempts');
      }

      showToast({
        type: 'error',
        title: t('Signup.errorTitle'),
        message: errorMessage,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, {paddingTop: top}]}>
        <Image source={logo} style={styles.appIcon} />
      </View>
      <SignupForm
        onSubmit={handleSignup}
        submitInProgress={signupInProgress}
        onGoogleSignup={handleGoogleSignup}
        onAppleSignup={handleAppleSignup}
        onFacebookSignup={handleFacebookSignup}
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
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  topSection: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
