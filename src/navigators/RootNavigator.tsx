import {Linking, StatusBar} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
  createNavigationContainerRef,
} from '@react-navigation/native';
import AuthStackNavigator from './AuthStackNavigator';
import MainStackNavigator from './MainStackNavigator';
import {useAppDispatch, useTypedSelector} from '../sharetribeSetup';
import {isAuthenticatedSelector} from '../slices/auth.slice';
import {fetchCurrentUser} from '../slices/user.slice';
import {EmailVerificationModal} from '../components';
import {handleDeepLinkUrl} from '../utils/deepLinkHandler';

export const navigationRef = createNavigationContainerRef();

const RootNavigator = () => {
  const isAuthenticated = useTypedSelector(isAuthenticatedSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser({})).unwrap();
    }
  }, [isAuthenticated, dispatch]);

  // Setup deep linking
  useEffect(() => {
    // Handle initial URL if app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLinkUrl(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', event =>
      handleDeepLinkUrl(event.url),
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef as any}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
      <EmailVerificationModal />
    </>
  );
};

export default RootNavigator;
