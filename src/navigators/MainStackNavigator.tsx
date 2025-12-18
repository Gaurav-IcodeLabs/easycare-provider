import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainStackParamList} from '../apptypes';
import {SCREENS} from '../constants';
import {
  CreateService,
  CreateProduct,
  CreateBusiness,
  EditListing,
  Profile,
  EditProfile,
  ChangePassword,
  ChangeEmail,
  Listings,
  SetupPayout,
} from '../screens';
import {BottomTabNavigator} from './BottomTabNavigator';
import {OtpVerified, VerifyOtp} from '../screens';
import {phoneNumberVerifiedSelector} from '../slices/user.slice';
import {useTypedSelector} from '../sharetribeSetup';

const {Navigator, Screen} = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  const phoneNumberVerified = useTypedSelector(phoneNumberVerifiedSelector);
  const initialRouteName =
    // __DEV__? SCREENS.MAIN_TABS:
    phoneNumberVerified ? SCREENS.MAIN_TABS : SCREENS.VERIFT_OTP;
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
      <Screen name={SCREENS.EDIT_PROFILE} component={EditProfile} />
      <Screen name={SCREENS.CHANGE_PASSWORD} component={ChangePassword} />
      <Screen name={SCREENS.CHANGE_EMAIL} component={ChangeEmail} />
      <Screen name={SCREENS.EDITLISTING} component={EditListing} />
      <Screen name={SCREENS.CREATE_SERVICE} component={CreateService} />
      <Screen name={SCREENS.CREATE_PRODUCT} component={CreateProduct} />
      <Screen name={SCREENS.CREATE_BUSINESS} component={CreateBusiness} />
      <Screen name={SCREENS.LISTINGS} component={Listings} />
      <Screen name={SCREENS.SETUP_PAYOUT} component={SetupPayout} />
    </Navigator>
  );
};

export default MainStackNavigator;
