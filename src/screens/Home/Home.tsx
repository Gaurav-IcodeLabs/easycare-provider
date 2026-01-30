import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  I18nManager,
} from 'react-native';
import React, {useEffect} from 'react';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {scale, width} from '../../utils';
import {colors, ListingType, SCREENS, secondaryFont} from '../../constants';
import {GradientWrapper, AppText, ListingCard, Button} from '../../components';
import {
  avatarPlaceholder,
  businessStepIcons,
  easycare,
  magnify,
} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../apptypes';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  fetchServices,
  fetchProducts,
  fetchListingsInProgressSelector,
  serviceIdsSelector,
  productIdsSelector,
} from '../../slices/home.slice';
import {getOwnListingsById} from '../../slices/marketplaceData.slice';
import {useTranslation} from 'react-i18next';
import {
  businessProfileSetupCompletedSelector,
  payoutSetupCompletedSelector,
  currentUserProfileImageUrlSelector,
  fetchCurrentUserInProgressSelector,
} from '../../slices/user.slice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStatusBar} from '../../hooks';

type HomeNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  typeof SCREENS.HOME
>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  useStatusBar('light-content');
  const entities = useTypedSelector(state => state.marketplaceData.entities);
  const servicesIds = useTypedSelector(serviceIdsSelector);
  const productsIds = useTypedSelector(productIdsSelector);
  const services = getOwnListingsById(entities, servicesIds);
  const products = getOwnListingsById(entities, productsIds);
  const profileImageUrl = useTypedSelector(currentUserProfileImageUrlSelector);
  const {top} = useSafeAreaInsets();

  const isLoading = useTypedSelector(fetchListingsInProgressSelector);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);

  const isBusinessProfileSetup = useTypedSelector(
    businessProfileSetupCompletedSelector,
  );
  const isPayoutSetup = useTypedSelector(payoutSetupCompletedSelector);

  // Check if user data is loaded to prevent flashing
  const fetchCurrentUserInProgress = useTypedSelector(
    fetchCurrentUserInProgressSelector,
  );
  const businessListingId = useTypedSelector(
    state =>
      state.user.currentUser?.attributes.profile.publicData?.businessListingId,
  );
  const businessListing = useTypedSelector(state =>
    businessListingId
      ? state.marketplaceData?.entities?.ownListing?.[businessListingId]
      : null,
  );

  // Only show setup screen after data is loaded and setup is incomplete
  const isDataLoaded =
    !fetchCurrentUserInProgress && (businessListingId ? businessListing : true);
  const showSetupScreen =
    !isInitializing &&
    isDataLoaded &&
    (!isBusinessProfileSetup || !isPayoutSetup);

  useEffect(() => {
    loadAllListings();

    // Wait for user data to be loaded before showing the UI
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300); // Slightly longer delay to ensure data is loaded

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllListings = () => {
    dispatch(fetchServices());
    dispatch(fetchProducts());
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchServices()), dispatch(fetchProducts())]);
    setRefreshing(false);
  }, [dispatch]);

  const handleProfilePress = () => {
    navigation.navigate(SCREENS.PROFILE);
  };

  const handleListingPress = (listing: any) => {
    const listingType = listing?.attributes?.publicData?.listingType;
    const listingId = listing?.id?.uuid;

    if (listingType === ListingType.SERVICE) {
      navigation.navigate(SCREENS.CREATE_SERVICE, {listingId});
    } else if (listingType === ListingType.PRODUCT) {
      navigation.navigate(SCREENS.CREATE_PRODUCT, {
        listingId,
      });
    }
  };

  const renderListingItem = ({item}: any) => {
    return (
      <ListingCard
        listing={item}
        containerStyle={styles.listingCard}
        onPress={() => handleListingPress(item)}
      />
    );
  };

  const handleViewAll = (type: ListingType) => {
    navigation.navigate(SCREENS.LISTINGS, {listingType: type});
  };

  const renderSection = (title: string, type: ListingType, data: any[]) => {
    if (data.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText style={styles.sectionTitle}>{title}</AppText>
          <TouchableOpacity onPress={() => handleViewAll(type)}>
            <AppText style={styles.viewAll}>{t('HOME.viewAll')}</AppText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          renderItem={renderListingItem}
          keyExtractor={item => item.id.uuid}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  // Show loading screen during initialization or while user data is loading
  if (isInitializing || !isDataLoaded) {
    return (
      <GradientWrapper
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.5}}
        colors={[colors.deepBlue, colors.blue]}>
        <ScreenHeader
          containerStyle={{
            paddingHorizontal: scale(20),
            marginTop: Math.min(top, scale(20)),
          }}
          renderCenter={() => <Image source={easycare} resizeMode="contain" />}
        />
        <View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" color={colors.white} /> */}
        </View>
      </GradientWrapper>
    );
  }

  if (showSetupScreen) {
    return (
      <GradientWrapper
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.5}}
        colors={[colors.deepBlue, colors.blue]}>
        <ScreenHeader
          containerStyle={{
            paddingHorizontal: scale(20),
            marginTop: Math.min(top, scale(20)),
          }}
          renderCenter={() => <Image source={easycare} resizeMode="contain" />}
        />
        <View style={styles.setupContainer}>
          <AppText style={styles.setupTitle}>
            {t('HOME.welcomeProvider')}
          </AppText>
          <AppText style={styles.setupDescription}>
            {t('HOME.setupDescription')}
          </AppText>

          <View style={styles.setupSteps}>
            <View
              style={[
                styles.setupStep,
                isBusinessProfileSetup && styles.setupStepCompleted,
              ]}>
              <Image
                source={
                  isBusinessProfileSetup
                    ? businessStepIcons.completed
                    : businessStepIcons.info
                }
                style={styles.stepIcon}
              />
              <View style={styles.stepContent}>
                <AppText style={styles.stepTitle}>
                  {t('HOME.setupBusiness')}
                </AppText>
                <AppText style={styles.stepDescription}>
                  {t('HOME.setupBusinessDesc')}
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.setupStep,
                isPayoutSetup && styles.setupStepCompleted,
              ]}>
              <Image
                source={
                  isPayoutSetup
                    ? businessStepIcons.completed
                    : businessStepIcons.payout
                }
                style={styles.stepIcon}
              />

              <View style={styles.stepContent}>
                <AppText style={styles.stepTitle}>
                  {t('HOME.setupPayout')}
                </AppText>
                <AppText style={styles.stepDescription}>
                  {t('HOME.setupPayoutDesc')}
                </AppText>
              </View>
            </View>
          </View>

          <Button
            title={t(
              isBusinessProfileSetup
                ? 'HOME.completePayoutSetup'
                : 'HOME.completeAccountSetup',
            )}
            onPress={() =>
              navigation.navigate(
                isBusinessProfileSetup
                  ? SCREENS.SETUP_PAYOUT
                  : SCREENS.CREATE_BUSINESS,
              )
            }
            style={styles.setupButton}
            titleStyle={{color: colors.deepBlue}}
          />
        </View>
      </GradientWrapper>
    );
  }

  return (
    <GradientWrapper
      start={{x: 0, y: 0}}
      end={{x: 0, y: 0.5}}
      colors={[colors.deepBlue, colors.blue, colors.white]}>
      <ScreenHeader
        containerStyle={{paddingHorizontal: scale(20)}}
        renderLeft={() => (
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={
                profileImageUrl ? {uri: profileImageUrl} : avatarPlaceholder
              }
              style={styles.left}
            />
          </TouchableOpacity>
        )}
        renderCenter={() => <Image source={easycare} resizeMode="contain" />}
        renderRight={() => (
          <TouchableOpacity>
            <Image source={magnify} style={styles.right} />
          </TouchableOpacity>
        )}
      />

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.deepBlue} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.deepBlue}
              colors={[colors.deepBlue]}
            />
          }>
          {renderSection(
            t('HOME.servicelisting'),
            ListingType.SERVICE,
            services,
          )}
          {renderSection(
            t('HOME.productlisting'),
            ListingType.PRODUCT,
            products,
          )}

          {services.length === 0 && products.length === 0 && (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>{t('HOME.noListings')}</AppText>
            </View>
          )}
        </ScrollView>
      )}
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: colors.milkWhite,
  },
  topsection: {
    width: width,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    // paddingTop: topInset,
    justifyContent: 'flex-start',
    paddingBottom: scale(80),
  },
  right: {
    width: scale(40),
    height: scale(40),
    padding: scale(8),
    backgroundColor: '#417ABD',
    borderRadius: scale(10),
  },
  left: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
  },
  headerImgContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
    marginTop: scale(10),
  },
  discountImg: {
    width: scale(135),
    height: scale(123),
  },
  carwashImg: {
    width: scale(170),
    height: scale(125),
  },
  scrollContainer: {
    paddingVertical: scale(20),
    gap: scale(20),
  },
  section: {gap: scale(12)},
  sectionTitle: {
    fontSize: scale(20),
    ...secondaryFont('500'),
    lineHeight: 28,
    color: colors.deepBlue,
  },
  horizontalList: {
    paddingHorizontal: scale(20),
    gap: scale(15),
  },
  listingCard: {
    width: scale(280),
    marginRight: scale(15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(50),
  },
  emptyText: {
    fontSize: scale(16),
    color: colors.neutralDark,
  },
  viewAll: {
    fontSize: scale(14),
    fontWeight: '500',
    ...secondaryFont('400'),
    color: colors.deepBlue,
  },
  sectionHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  setupContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: scale(40),
  },
  setupTitle: {
    fontSize: scale(32),
    ...secondaryFont('600'),
    color: colors.white,
    marginBottom: scale(12),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  setupDescription: {
    fontSize: scale(16),
    ...secondaryFont('400'),
    color: colors.white,
    marginBottom: scale(32),
    opacity: 0.9,
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  setupSteps: {
    gap: scale(16),
    marginBottom: scale(40),
  },
  setupStep: {
    flexDirection: 'row',
    gap: scale(16),
    backgroundColor: colors.deepBlue + '70',
    padding: scale(16),
    borderRadius: scale(12),
  },
  setupStepCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.7,
  },
  stepNumber: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    fontSize: scale(18),
    ...secondaryFont('600'),
    color: colors.deepBlue,
  },
  stepNumberTextCompleted: {
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: scale(16),
    ...secondaryFont('600'),
    color: colors.white,
    marginBottom: scale(4),
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  stepDescription: {
    fontSize: scale(14),
    ...secondaryFont('400'),
    color: colors.white,
    opacity: 0.8,
    ...(I18nManager.isRTL && {textAlign: 'left'}),
  },
  setupButton: {
    backgroundColor: colors.white,
    paddingVertical: scale(16),
    borderRadius: scale(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupButtonText: {
    fontSize: scale(16),
    ...secondaryFont('600'),
    color: colors.deepBlue,
  },
  stepIcon: {
    height: scale(48),
    width: scale(48),
    objectFit: 'contain',
  },
});
