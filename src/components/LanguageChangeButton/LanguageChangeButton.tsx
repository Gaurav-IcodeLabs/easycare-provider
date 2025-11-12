import React from 'react';
import {
  View,
  Switch,
  StyleSheet,
  Alert,
  BackHandler,
  NativeModules,
} from 'react-native';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {useLanguage} from '../../hooks';
import {AppText} from '../AppText/AppText';

// Try to import RNRestart safely
let RNRestart: any = null;
try {
  RNRestart = require('react-native-restart').default;
} catch (error) {
  console.warn('react-native-restart not available:', error);
}

interface LanguageChangeButtonProps {
  containerStyle?: object;
  switchStyle?: object;
  textStyle?: object;
}

export const LanguageChangeButton: React.FC<LanguageChangeButtonProps> = ({
  containerStyle,
  switchStyle,
  textStyle,
}) => {
  const {isArabic, switchLanguage} = useLanguage();

  const handleLanguageSwitch = async (value: boolean) => {
    const newLanguage = value ? 'ar' : 'en';
    const success = await switchLanguage(newLanguage);

    if (success) {
      Alert.alert(
        'Language Changed',
        'The app needs to restart to apply the language and layout changes. Please reopen the app after it closes.',
        [
          {
            text: 'Restart Now',
            onPress: () => {
              setTimeout(() => {
                try {
                  if (RNRestart && typeof RNRestart.restart === 'function') {
                    RNRestart.restart();
                  } else if (__DEV__ && NativeModules.DevSettings) {
                    NativeModules.DevSettings.reload();
                  } else {
                    BackHandler.exitApp();
                  }
                } catch (error) {
                  console.error('Error restarting app:', error);
                  BackHandler.exitApp();
                }
              }, 500);
            },
          },
          {
            text: 'Later',
            style: 'cancel',
          },
        ],
      );
    }
  };

  return (
    <View style={[styles.languageSwitch, containerStyle]}>
      <AppText
        style={[
          styles.languageText,
          !isArabic && styles.activeLanguage,
          textStyle,
        ]}>
        EN
      </AppText>
      <Switch
        value={isArabic}
        onValueChange={handleLanguageSwitch}
        trackColor={{false: colors.lightGrey, true: colors.blue}}
        thumbColor={colors.white}
        style={[styles.switch, switchStyle]}
      />
      <AppText
        style={[
          styles.languageText,
          isArabic && styles.activeLanguage,
          textStyle,
        ]}>
        AR
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  languageSwitch: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'center',
    borderRadius: scale(25),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  switch: {
    // borderWidth: 1,
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  languageText: {
    fontSize: scale(14),
    color: colors.grey,
    ...primaryFont('500'),
  },
  activeLanguage: {
    color: colors.blue,
  },
});
