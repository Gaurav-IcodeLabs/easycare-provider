import {Linking} from 'react-native';
import React, {useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import AuthStackNavigator from './AuthStackNavigator';
import MainStackNavigator from './MainStackNavigator';
import {useAppDispatch, useTypedSelector} from '../sharetribeSetup';
import {isAuthenticatedSelector} from '../slices/auth.slice';
import {fetchCurrentUser} from '../slices/user.slice';
import {fetchBusinessListing} from '../slices/createBusiness.slice';
import {EmailVerificationModal} from '../components';
import {handleDeepLinkUrl} from '../utils/deepLinkHandler';
import {useStatusBar} from '../hooks/useStatusBar';
import {types as sdkTypes} from '../utils/sdkLoader';

export const navigationRef = createNavigationContainerRef();

const RootNavigator = () => {
  const isAuthenticated = useTypedSelector(isAuthenticatedSelector);
  const dispatch = useAppDispatch();

  // Set status bar to dark app-wide
  useStatusBar('dark-content');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser({}))
        .unwrap()
        .then(user => {
          const existingBusinessId =
            user?.attributes?.profile?.publicData?.businessListingId;
          if (existingBusinessId) {
            dispatch(
              fetchBusinessListing({id: new sdkTypes.UUID(existingBusinessId)}),
            );
          }
        });
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
        {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
      <EmailVerificationModal />
    </>
  );
};

export default RootNavigator;
