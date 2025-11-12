import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainStackParamList} from '../apptypes';
import {SCREENS} from '../constants';
import {Profile} from '../screens';
import {BottomTabNavigator} from './BottomTabNavigator';

const {Navigator, Screen} = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => (
  <Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Screen name={SCREENS.MAIN_TABS} component={BottomTabNavigator} />
    <Screen name={SCREENS.PROFILE} component={Profile} />
  </Navigator>
);

export default MainStackNavigator;
