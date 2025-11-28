import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainStackParamList} from '../apptypes';
import {SCREENS} from '../constants';
import {EditListing, Profile} from '../screens';
import {BottomTabNavigator} from './BottomTabNavigator';
import {OtpVerified, VerifyOtp} from '../screens';
import {phoneNumberVerifiedSelector} from '../slices/user.slice';
import {useTypedSelector} from '../sharetribeSetup';

const {Navigator, Screen} = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  const phoneNumberVerified = useTypedSelector(phoneNumberVerifiedSelector);
  const initialRouteName = __DEV__
    ? SCREENS.MAIN_TABS
    : phoneNumberVerified
    ? SCREENS.MAIN_TABS
    : SCREENS.VERIFT_OTP;
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}>
      <Screen name={SCREENS.MAIN_TABS} component={BottomTabNavigator} />
      <Screen name={SCREENS.VERIFT_OTP} component={VerifyOtp} />
      <Screen name={SCREENS.OTP_VERIFIED} component={OtpVerified} />
      <Screen name={SCREENS.PROFILE} component={Profile} />
      <Screen name={SCREENS.EDITLISTING} component={EditListing} />
  </Navigator>
  );
};

export default MainStackNavigator;
