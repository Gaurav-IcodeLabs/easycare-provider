import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainStackParamList} from '../apptypes';
import {SCREENS, colors} from '../constants';
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
import {
  fetchCurrentUserInProgressSelector,
  phoneNumberVerifiedSelector,
} from '../slices/user.slice';
import {useTypedSelector} from '../sharetribeSetup';

const {Navigator, Screen} = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  const fetchCurrentUserInProcess = useTypedSelector(
    fetchCurrentUserInProgressSelector,
  );
  const phoneNumberVerified = useTypedSelector(phoneNumberVerifiedSelector);

  if (fetchCurrentUserInProcess) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.deepBlue} />
      </View>
    );
  }

  const initialRouteName = phoneNumberVerified
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

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default MainStackNavigator;
