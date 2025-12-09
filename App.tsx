import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet, Image} from 'react-native';
import {hideSplash} from 'react-native-splash-view';
import Toast from 'react-native-toast-message';
import i18n from './src/locales/index';
import {I18nextProvider} from 'react-i18next';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {RootNavigator} from './src/navigators';
import {persistor, store} from './src/sharetribeSetup';
import {splashImage} from './src/assets';
import {height, width} from './src/utils';
import {fetchAppAssets} from './src/slices/hostedAssets.slice';
import {ColorsProvider, ConfigurationProvider} from './src/context';
import {mergeColors} from './src/constants';
import {configureGoogleSignIn} from './src/utils/socialAuth.helpers';
import {fetchServicesConfig} from './src/slices/marketplaceData.slice';
import {Settings} from 'react-native-fbsdk-next';
import {authInfo} from './src/slices/auth.slice';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const initializeApp = useCallback(async () => {
    try {
      // Example: Wait for i18n to load translations
      if (!i18n.isInitialized) {
        await i18n.init();
      }

      // Check auth status first
      await store.dispatch(authInfo()).unwrap();

      const res: any = await store.dispatch(fetchAppAssets()).unwrap();
      if (res.appConfig) {
        setConfig({
          appConfig: res?.appConfig,
          colors: mergeColors(res?.appConfig?.branding),
        });
      }
      await store.dispatch(fetchServicesConfig()).unwrap();
      // Add other async initializations here:
      // - Load fonts
      // - Preload critical data
      // await Font.loadAsync(...);
    } catch (error) {
      console.error('App initialization failed:', error);
    } finally {
      setIsReady(true);
      // Hide splash screen only after everything is ready
      hideSplash();
    }
  }, []);

  useEffect(() => {
    initializeApp();
    configureGoogleSignIn();

    // Initialize Facebook SDK
    Settings.initializeSDK();
  }, [initializeApp]);

  // Optional: Show a minimal loading screen instead of empty fragment
  if (!isReady) {
    return <Image source={splashImage} style={styles.splashImage} />;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={styles.container}>
        <KeyboardProvider>
          <ConfigurationProvider value={config?.appConfig}>
            <ColorsProvider value={config?.colors}>
              <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  <BottomSheetModalProvider>
                    <I18nextProvider i18n={i18n}>
                      <RootNavigator />
                      <Toast />
                    </I18nextProvider>
                  </BottomSheetModalProvider>
                </PersistGate>
              </Provider>
            </ColorsProvider>
          </ConfigurationProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashImage: {objectFit: 'cover', width: width, height: height},
});

export default App;
