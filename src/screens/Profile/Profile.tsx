import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Linking,
} from 'react-native';
import React, {useCallback} from 'react';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import {scale} from '../../utils';
import {colors, primaryFont} from '../../constants';
import {
  AppText,
  BiometricSettings,
  GradientWrapper,
  LanguageChangeButton,
} from '../../components';
import {placeholder, profileEditIcon, rightup} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {getProfileOptions, ProfileOption} from './helper';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {resetAllSlices, useAppDispatch} from '../../sharetribeSetup';
import {logout} from '../../slices/auth.slice';

const WALLET_AMOUNT = '50 SAR';
const GRADIENT_COLORS = [colors.deepBlue, colors.blue, colors.white];
const GRADIENT_END = {x: 0.5, y: 0.6};

export const Profile: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;
  const dispatch = useAppDispatch();

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX(isRTL ? 10 : -10)
    .failOffsetY([-10, 10])
    .onEnd(event => {
      const swipeDistance = Math.abs(event.translationX);

      if (swipeDistance > 50) {
        runOnJS(handleBackPress)();
      }
    });

  const handleLogout = useCallback(async () => {
    await Promise.all([dispatch(logout()), dispatch(resetAllSlices())]);
  }, [dispatch]);

  const handleItemPress = useCallback(
    async (option: ProfileOption) => {
      const {actionType, id, url} = option;

      switch (actionType) {
        case 'action':
          if (id === 'logout') {
            await handleLogout();
          }
          break;
        case 'link':
          if (url) {
            Linking.openURL(url);
          }
          break;
        case 'navigation':
        default:
          break;
      }
    },
    [handleLogout],
  );

  const renderProfileHeader = useCallback(
    () => (
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={placeholder} style={styles.profileImage} />
        </TouchableOpacity>
        <AppText numberOfLines={2} style={styles.profileName}>
          Mohammed Ziyad Awadh
        </AppText>
      </View>
    ),
    [handleBackPress],
  );

  const renderWalletSection = useCallback(
    () => (
      <View style={styles.walletContainer}>
        <AppText style={[styles.walletText, styles.walletLabel]}>
          {t('Profile.myWallet')}:{' '}
        </AppText>
        <AppText style={styles.walletText}>{WALLET_AMOUNT}</AppText>
      </View>
    ),
    [t],
  );

  const renderOptionItem = useCallback(
    (option: ProfileOption, index: number, array: ProfileOption[]) => {
      const isLastItem = index === array.length - 1;

      return (
        <TouchableOpacity
          key={option.id}
          style={styles.optionItem}
          onPress={() => handleItemPress(option)}
          activeOpacity={0.7}>
          <View style={styles.optionContent}>
            <View style={styles.optionIcon}>
              <Image
                source={option.icon}
                style={[styles.iconPlaceholder, isRTL && styles.arrowIconRTL]}
                {...(!isLastItem && {tintColor: colors.deepBlue})}
              />
            </View>
            <AppText style={styles.optionText}>{t(option.title)}</AppText>
          </View>
          <Image
            source={rightup}
            style={[styles.arrowIcon, isRTL && styles.arrowIconRTL]}
          />
        </TouchableOpacity>
      );
    },
    [handleItemPress, isRTL, t],
  );

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <GradientWrapper colors={GRADIENT_COLORS} end={GRADIENT_END}>
          <ScreenHeader
            containerStyle={styles.headerContainer}
            renderLeft={renderProfileHeader}
            rightIcon={profileEditIcon}
          />

          <ScrollView
            contentContainerStyle={styles.contentSection}
            showsVerticalScrollIndicator={false}>
            {renderWalletSection()}

            {/* Biometric Settings Section */}
            <View style={styles.biometricSection}>
              <BiometricSettings />
            </View>

            <View style={styles.optionsContainer}>
              {getProfileOptions()?.map((option, index, array) =>
                renderOptionItem(option, index, array),
              )}
            </View>

            <View style={styles.languageSwitchContainer}>
              <LanguageChangeButton />
            </View>
          </ScrollView>
        </GradientWrapper>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: scale(20),
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  profileImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
  },
  profileName: {
    fontSize: scale(18),
    color: colors.white,
    maxWidth: scale(210),
    ...primaryFont('600'),
  },
  contentSection: {
    flexGrow: 1,
    paddingTop: scale(20),
    paddingHorizontal: scale(20),
    paddingBottom: scale(40),
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(30),
  },
  walletLabel: {
    color: colors.white,
  },
  walletText: {
    fontSize: scale(24),
    color: colors.blue,
    ...primaryFont('600'),
  },
  biometricSection: {
    marginBottom: scale(20),
  },
  optionsContainer: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
    marginBottom: scale(8),
    backgroundColor: colors.white,
    borderRadius: scale(12),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: scale(12),
  },
  iconPlaceholder: {
    width: scale(24),
    height: scale(24),
  },
  optionText: {
    fontSize: scale(16),
    color: colors.lightblack,
    flex: 1,
    textAlign: 'left',
    ...primaryFont('500'),
  },
  arrowIcon: {
    width: scale(24),
    height: scale(24),
  },
  arrowIconRTL: {
    transform: [{scaleX: -1}],
  },
  languageSwitchContainer: {
    alignItems: 'center',
    marginTop: scale(20),
    marginBottom: scale(20),
  },
});
