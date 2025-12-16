import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  I18nManager,
} from 'react-native';
import React, {useEffect, useCallback} from 'react';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {scale} from '../../utils';
import {colors, ListingType, SCREENS} from '../../constants';
import {GradientWrapper, AppText, ListingCard} from '../../components';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../apptypes';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  fetchListings,
  fetchListingsInProgressSelector,
  listingIdsSelector,
  hasMoreSelector,
  paginationSelector,
  resetListings,
} from '../../slices/listings.slice';
import {getOwnListingsById} from '../../slices/marketplaceData.slice';
import {useTranslation} from 'react-i18next';
import {backIcon} from '../../assets';

type ListingsNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  typeof SCREENS.LISTINGS
>;

type ListingsRouteProp = RouteProp<MainStackParamList, typeof SCREENS.LISTINGS>;

export const Listings: React.FC = () => {
  const navigation = useNavigation<ListingsNavigationProp>();
  const route = useRoute<ListingsRouteProp>();
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const {listingType} = route.params;

  const entities = useTypedSelector(state => state.marketplaceData.entities);
  const listingIds = useTypedSelector(listingIdsSelector);
  const listings = getOwnListingsById(entities, listingIds);

  const isLoading = useTypedSelector(fetchListingsInProgressSelector);
  const hasMore = useTypedSelector(hasMoreSelector);
  const pagination = useTypedSelector(paginationSelector);

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Reset and fetch first page when screen mounts
    dispatch(resetListings());
    dispatch(fetchListings({listingType, page: 1, perPage: 20}));
  }, [dispatch, listingType]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(resetListings());
    await dispatch(fetchListings({listingType, page: 1, perPage: 20}));
    setRefreshing(false);
  }, [dispatch, listingType]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) {
      return;
    }

    const nextPage = pagination.page + 1;
    dispatch(
      fetchListings({
        listingType,
        page: nextPage,
        perPage: 20,
        isLoadMore: true,
      }),
    );
  }, [dispatch, listingType, isLoading, hasMore, pagination.page]);

  const handleListingPress = (listing: any) => {
    const listingId = listing?.id?.uuid;

    if (listingType === ListingType.SERVICE) {
      navigation.navigate(SCREENS.CREATE_SERVICE, {listingId});
    } else if (listingType === ListingType.PRODUCT) {
      navigation.navigate(SCREENS.CREATE_PRODUCT, {listingId});
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

  const renderFooter = () => {
    if (!isLoading || refreshing) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.deepBlue} />
      </View>
    );
  };

  const getTitle = () => {
    return listingType === ListingType.SERVICE
      ? t('HOME.servicelisting')
      : t('HOME.productlisting');
  };

  return (
    <GradientWrapper
      start={{x: 0, y: 0}}
      end={{x: 0, y: 0.5}}
      colors={[colors.deepBlue, colors.blue, colors.white]}>
      <ScreenHeader
        containerStyle={{paddingHorizontal: scale(20)}}
        renderCenter={() => (
          <AppText style={styles.headerTitle}>{getTitle()}</AppText>
        )}
        renderLeft={() => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={backIcon}
              style={[styles.backIcon, isRTL && {transform: [{scaleX: -1}]}]}
            />
          </TouchableOpacity>
        )}
      />

      {isLoading && !refreshing && listings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.deepBlue} />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={item => item.id.uuid}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.deepBlue}
              colors={[colors.deepBlue]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>{t('HOME.noListings')}</AppText>
            </View>
          }
        />
      )}
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    gap: scale(15),
  },
  listingCard: {
    width: '100%',
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
  footerLoader: {
    paddingVertical: scale(20),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.white,
  },
  backButton: {
    fontSize: scale(24),
    color: colors.white,
    fontWeight: '600',
  },
  backIcon: {
    tintColor: colors.white,
    height: scale(24),
    width: scale(24),
  },
});
