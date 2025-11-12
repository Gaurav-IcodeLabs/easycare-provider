import {useFocusEffect} from '@react-navigation/native';
import {Platform, StatusBar} from 'react-native';
import {useCallback} from 'react';
import {SystemBars} from 'react-native-edge-to-edge';

export const useStatusBar = (barStyle: 'dark-content' | 'light-content') => {
  useFocusEffect(
    useCallback(() => {
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
    }, [barStyle]),
  );
};
