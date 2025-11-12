import React, {useMemo, useRef} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import SignupForm from './components/SignupForm';
import {AUTH, colors} from '../../constants';
import {AuthStackParamList, SignupParams} from '../../apptypes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import {scale, useToast} from '../../utils';
import {GradientWrapper} from '../../components';
import {logo} from '../../assets';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {signup, signUpInProgressSelector} from '../../slices/auth.slice';
import {SignupFormValues} from './helper';

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const Signup: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const signupInProgress = useTypedSelector(signUpInProgressSelector);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const {showToast} = useToast();

  const snapPoints = useMemo(() => ['75%', '75%'], []);

  const handleSignup = async (values: SignupFormValues) => {
    try {
      const signupParams: SignupParams = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        displayName: values.fullName,
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
        <SignupForm
          onSubmit={handleSignup}
          submitInProgress={signupInProgress}
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
