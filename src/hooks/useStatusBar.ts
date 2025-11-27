import {Platform, StatusBar} from 'react-native';
import {useEffect} from 'react';
import {SystemBars} from 'react-native-edge-to-edge';

export const useStatusBar = (barStyle: 'dark-content' | 'light-content') => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // For iOS, use the standard StatusBar API
      StatusBar.setBarStyle(barStyle, true);
    } else if (Platform.OS === 'android') {
      // For Android, use react-native-edge-to-edge SystemBars
      const isDarkContent = barStyle === 'dark-content';
      // Update system bars appearance
      SystemBars.setStyle(isDarkContent ? 'dark' : 'light');
      // Keep status bar translucent for edge-to-edge
      StatusBar.setTranslucent(true);
    }
  }, [barStyle]);
};
