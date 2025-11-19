import { StatusBar } from 'react-native';
import React, { useEffect, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import AuthStackNavigator from './AuthStackNavigator';
import MainStackNavigator from './MainStackNavigator';
import {
  resetAllSlices,
  useAppDispatch,
  useTypedSelector,
} from '../sharetribeSetup';
import { isAuthenticatedSelector } from '../slices/auth.slice';
import { fetchCurrentUser } from '../slices/user.slice';

const RootNavigator = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const isAuthenticated = useTypedSelector(isAuthenticatedSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser({})).unwrap();
    }
  }, [isAuthenticated, dispatch]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
