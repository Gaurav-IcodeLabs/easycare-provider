import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../apptypes';
import {AUTH} from '../constants';
import {
  Login,
  Onboarding,
  VerifyOtp,
  OtpVerified,
  ForgotPassword,
  NewPassword,
} from '../screens';
import {Signup} from '../screens';
import {useTypedSelector} from '../sharetribeSetup';
import {skipOnboardingSelector} from '../slices/app.slice';

const {Navigator, Screen} = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator: React.FC = () => {
  const skippedOnbording = useTypedSelector(skipOnboardingSelector);
  return (
    <Navigator
      initialRouteName={skippedOnbording ? AUTH.LOGIN : AUTH.ONBOARDING}
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name={AUTH.ONBOARDING} component={Onboarding} />
      <Screen name={AUTH.LOGIN} component={Login} />
      <Screen name={AUTH.SIGNUP} component={Signup} />
      <Screen name={AUTH.FORGOT_PASSWORD} component={ForgotPassword} />
      <Screen name={AUTH.NEW_PASSWORD} component={NewPassword} />
      <Screen name={AUTH.VERIFT_OTP} component={VerifyOtp} />
      <Screen name={AUTH.OTP_VERIFIED} component={OtpVerified} />
    </Navigator>
  );
};

export default AuthStackNavigator;
