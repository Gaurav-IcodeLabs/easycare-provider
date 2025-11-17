import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Home, Orders, Cart, Profile} from '../screens';
import {SCREENS} from '../constants';
import {BottomTabParamList} from '../apptypes';
import {CustomTabBar} from '../components';

const {Navigator, Screen} = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator = () => {
  return (
    <Navigator
      initialRouteName={SCREENS.HOME}
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Screen name={SCREENS.HOME} component={Home} />
      <Screen name={SCREENS.MY_ORDERS} component={Orders} />
      <Screen name={SCREENS.PROFILE} component={Profile} />
    </Navigator>
  );
};
