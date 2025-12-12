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
import {GradientWrapper, AppText, ListingCard} from '../../components';
import {avatarPlaceholder, easycare, magnify, placeholder} from '../../assets';
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
import {businessListingSetupCompletedSelector} from '../../slices/user.slice';
import {currentUserProfileImageUrlSelector} from '../../slices/user.slice';

type HomeNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  typeof SCREENS.HOME
>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const entities = useTypedSelector(state => state.marketplaceData.entities);
  const servicesIds = useTypedSelector(serviceIdsSelector);
  const productsIds = useTypedSelector(productIdsSelector);
  const services = getOwnListingsById(entities, servicesIds);
  const products = getOwnListingsById(entities, productsIds);
  const profileImageUrl = useTypedSelector(currentUserProfileImageUrlSelector);

  const isLoading = useTypedSelector(fetchListingsInProgressSelector);
  const [refreshing, setRefreshing] = React.useState(false);

  const isBusinessListingSetup = useTypedSelector(
    businessListingSetupCompletedSelector,
  );

  useEffect(() => {
    loadAllListings();
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

  if (!isBusinessListingSetup) {
    return (
      <GradientWrapper
        start={{x: 0, y: 0}}
        end={{x: 0, y: 0.5}}
        colors={[colors.deepBlue, colors.blue]}>
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
        />
        <View style={styles.setupContainer}>
          <AppText style={styles.setupTitle}>
            {t('HOME.welcomeProvider')}
          </AppText>
          <AppText style={styles.setupDescription}>
            {t('HOME.setupDescription')}
          </AppText>

          <View style={styles.setupSteps}>
            <TouchableOpacity
              style={styles.setupStep}
              onPress={() => navigation.navigate(SCREENS.CREATE_BUSINESS)}>
              <View style={styles.stepNumber}>
                <AppText style={styles.stepNumberText}>1</AppText>
              </View>
              <View style={styles.stepContent}>
                <AppText style={styles.stepTitle}>
                  {t('HOME.setupBusiness')}
                </AppText>
                <AppText style={styles.stepDescription}>
                  {t('HOME.setupBusinessDesc')}
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.setupStep}
              onPress={() => navigation.navigate(SCREENS.CREATE_BUSINESS)}>
              <View style={styles.stepNumber}>
                <AppText style={styles.stepNumberText}>2</AppText>
              </View>
              <View style={styles.stepContent}>
                <AppText style={styles.stepTitle}>
                  {t('HOME.setupAvailability')}
                </AppText>
                <AppText style={styles.stepDescription}>
                  {t('HOME.setupAvailabilityDesc')}
                </AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.setupStep}
              onPress={() => {
                // TODO: Navigate to payout setup screen
                // navigation.navigate(SCREENS.SETUP_PAYOUT);
              }}>
              <View style={styles.stepNumber}>
                <AppText style={styles.stepNumberText}>3</AppText>
              </View>
              <View style={styles.stepContent}>
                <AppText style={styles.stepTitle}>
                  {t('HOME.setupPayout')}
                </AppText>
                <AppText style={styles.stepDescription}>
                  {t('HOME.setupPayoutDesc')}
                </AppText>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => navigation.navigate(SCREENS.CREATE_BUSINESS)}>
            <AppText style={styles.setupButtonText}>
              {t('HOME.getStarted')}
            </AppText>
          </TouchableOpacity>
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
    fontSize: scale(24),
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
    gap: scale(20),
    marginBottom: scale(40),
  },
  setupStep: {
    flexDirection: 'row',
    gap: scale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: scale(16),
    borderRadius: scale(12),
  },
  stepNumber: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: scale(18),
    ...secondaryFont('600'),
    color: colors.deepBlue,
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
});
