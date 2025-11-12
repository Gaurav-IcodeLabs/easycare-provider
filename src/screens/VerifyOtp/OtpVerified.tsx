import {Image, Platform, StyleSheet, View} from 'react-native';
import React from 'react';
import {AppText, Button} from '../../components';
import {useTranslation} from 'react-i18next';
import {colors, primaryFont, SCREENS} from '../../constants';
import {scale, topInset} from '../../utils';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {checkCircle} from '../../assets';

export const OtpVerified: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const handleContinue = () => {
    // TODO: Implement authentication logic using Redux/Context or navigation to main stack
    console.log('User authenticated, navigating to main app');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image style={styles.checkIcon} source={checkCircle} />
          <AppText style={styles.heading}>
            {t('VerificationSuccess.heading')}
          </AppText>
          <AppText style={styles.message}>
            {t('VerificationSuccess.message')}
          </AppText>
        </View>

        <Button
          title={t('VerificationSuccess.button')}
          onPress={handleContinue}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingTop: topInset + scale(10),
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
    paddingBottom: scale(40),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  checkIcon: {
    width: scale(120),
    height: scale(120),
    marginBottom: scale(40),
  },
  heading: {
    color: colors.deepBlue,
    fontSize: scale(24),
    ...primaryFont('600'),
    textAlign: 'center',
    marginBottom: scale(16),
  },
  message: {
    fontSize: scale(16),
    color: colors.grey,
    ...primaryFont('400'),
    textAlign: 'center',
    lineHeight: scale(24),
  },
  button: {
    backgroundColor: colors.deepBlue,
    borderRadius: scale(12),
    height: scale(56),
  },
});
