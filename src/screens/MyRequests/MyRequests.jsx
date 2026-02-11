import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import React, {useEffect, useCallback, useState} from 'react';
import {backIcon} from '../../assets';
import {AppText, GradientWrapper, ScreenHeader} from '../../components';
import {useTranslation} from 'react-i18next';
import {colors, primaryFont} from '../../constants';
import {fontScale, scale} from '../../utils';
import {useStatusBar} from '../../hooks';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {currentUserIdSelector} from '../../slices/user.slice';
import {
  fetchServiceRequests,
  fetchProductRequests,
  serviceRequestsSelector,
  productRequestsSelector,
  servicePaginationSelector,
  productPaginationSelector,
  serviceHasMoreSelector,
  productHasMoreSelector,
  fetchServiceRequestsInProgressSelector,
  fetchProductRequestsInProgressSelector,
  resetServiceRequests,
  resetProductRequests,
} from '../../slices/requests.slice';

const TABS = {
  SERVICE: 'service',
  PRODUCT: 'product',
};

const MyRequests = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const currentUserId = useTypedSelector(currentUserIdSelector);
  useStatusBar('dark-content');
  const isRTL = I18nManager.isRTL;

  const [activeTab, setActiveTab] = useState(TABS.SERVICE);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const serviceRequests = useTypedSelector(serviceRequestsSelector);
  const productRequests = useTypedSelector(productRequestsSelector);
  const servicePagination = useTypedSelector(servicePaginationSelector);
  const productPagination = useTypedSelector(productPaginationSelector);
  const serviceHasMore = useTypedSelector(serviceHasMoreSelector);
  const productHasMore = useTypedSelector(productHasMoreSelector);
  const serviceLoading = useTypedSelector(
    fetchServiceRequestsInProgressSelector,
  );
  const productLoading = useTypedSelector(
    fetchProductRequestsInProgressSelector,
  );

  const initialLoadDone = React.useRef({
    service: false,
    product: false,
  });

  // Fetch data based on active tab
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    if (activeTab === TABS.SERVICE && !initialLoadDone.current.service) {
      initialLoadDone.current.service = true;
      dispatch(resetServiceRequests());
      dispatch(fetchServiceRequests({userId: currentUserId, page: 1}));
    } else if (activeTab === TABS.PRODUCT && !initialLoadDone.current.product) {
      initialLoadDone.current.product = true;
      dispatch(resetProductRequests());
      dispatch(fetchProductRequests({userId: currentUserId, page: 1}));
    }
  }, [dispatch, currentUserId, activeTab]);

  const onRefresh = useCallback(async () => {
    if (!currentUserId) {
      return;
    }
    setRefreshing(true);

    if (activeTab === TABS.SERVICE) {
      dispatch(resetServiceRequests());
      await dispatch(fetchServiceRequests({userId: currentUserId, page: 1}));
    } else {
      dispatch(resetProductRequests());
      await dispatch(fetchProductRequests({userId: currentUserId, page: 1}));
    }

    setRefreshing(false);
  }, [dispatch, currentUserId, activeTab]);

  const loadMore = useCallback(() => {
    if (!currentUserId) {
      return;
    }

    if (activeTab === TABS.SERVICE) {
      if (serviceLoading || !serviceHasMore || serviceRequests.length === 0) {
        return;
      }
      const nextPage = servicePagination.page + 1;
      dispatch(
        fetchServiceRequests({
          userId: currentUserId,
          page: nextPage,
          isLoadMore: true,
        }),
      );
    } else {
      if (productLoading || !productHasMore || productRequests.length === 0) {
        return;
      }
      const nextPage = productPagination.page + 1;
      dispatch(
        fetchProductRequests({
          userId: currentUserId,
          page: nextPage,
          isLoadMore: true,
        }),
      );
    }
  }, [
    dispatch,
    currentUserId,
    activeTab,
    serviceLoading,
    productLoading,
    serviceHasMore,
    productHasMore,
    servicePagination.page,
    productPagination.page,
    serviceRequests.length,
    productRequests.length,
  ]);

  const renderRequestCard = ({item}) => {
    const isExpanded = expandedCards[item._id] || false;

    const toggleExpand = () => {
      setExpandedCards(prev => ({
        ...prev,
        [item._id]: !prev[item._id],
      }));
    };

    const getStatusColor = status => {
      switch (status) {
        case 'pending':
          return '#FFF4E5';
        case 'approved':
          return '#E8F5E9';
        case 'completed':
          return '#E8F5E9';
        case 'rejected':
          return '#FFEBEE';
        default:
          return colors.lightGrey;
      }
    };

    const getStatusTextColor = status => {
      switch (status) {
        case 'pending':
          return '#F57C00';
        case 'approved':
          return '#4CAF50';
        case 'completed':
          return '#4CAF50';
        case 'rejected':
          return '#F44336';
        default:
          return colors.neutralDark;
      }
    };

    return (
      <Pressable
        style={styles.card}
        onPress={() => item.description && toggleExpand()}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTopLeft}>
            <AppText style={[styles.labelText, isRTL && styles.textRTL]}>
              {t('MyRequests.titleLabel') || 'Title'}
            </AppText>
            <AppText style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {item.title}
            </AppText>
          </View>
          <View style={styles.cardTopRight}>
            <AppText style={[styles.labelText, isRTL && styles.textRTL]}>
              {t('MyRequests.createdAtLabel') || 'Created at'}
            </AppText>
            <AppText style={[styles.dateText, isRTL && styles.textRTL]}>
              {new Date(item.createdAt).toLocaleString(
                isRTL ? 'ar-SA' : 'en-US',
                {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  // hour: '2-digit',
                  // minute: '2-digit',
                  // second: '2-digit',
                },
              )}
            </AppText>
          </View>
        </View>

        {item.description && (
          <View style={styles.descriptionSection}>
            <AppText style={[styles.labelText, isRTL && styles.textRTL]}>
              {t('MyRequests.descriptionLabel') || 'Description'}
            </AppText>
            <AppText
              style={[styles.description, isRTL && styles.textRTL]}
              numberOfLines={isExpanded ? undefined : 2}>
              {item.description}
            </AppText>
            {item.description.length > 100 && (
              <AppText style={[styles.expandText, isRTL && styles.textRTL]}>
                {isExpanded
                  ? t('MyRequests.showLess')
                  : t('MyRequests.showMore')}
              </AppText>
            )}
          </View>
        )}

        <View
          style={[
            styles.statusBanner,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <AppText
            style={[
              styles.statusBannerText,
              {color: getStatusTextColor(item.status)},
              isRTL && styles.textRTL,
            ]}>
            {t(`MyRequests.${item.status}`) || item.status}
          </AppText>
        </View>
      </Pressable>
    );
  };

  const currentRequests =
    activeTab === TABS.SERVICE ? serviceRequests : productRequests;
  const isLoading =
    activeTab === TABS.SERVICE ? serviceLoading : productLoading;

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

  const renderEmpty = () => {
    if (isLoading && !refreshing) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <AppText style={[styles.emptyText, isRTL && styles.textRTL]}>
          {t('MyRequests.noRequests')}
        </AppText>
      </View>
    );
  };

  return (
    <GradientWrapper colors={[colors.white, colors.white]}>
      <ScreenHeader
        leftIcon={backIcon}
        renderCenter={() => (
          <AppText style={[styles.heading, isRTL && styles.textRTL]}>
            {t('MyRequests.heading')}
          </AppText>
        )}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === TABS.SERVICE && styles.activeTab]}
          onPress={() => setActiveTab(TABS.SERVICE)}>
          <AppText
            style={[
              styles.tabText,
              activeTab === TABS.SERVICE && styles.activeTabText,
              isRTL && styles.textRTL,
            ]}>
            {t('MyRequests.serviceTab')}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === TABS.PRODUCT && styles.activeTab]}
          onPress={() => setActiveTab(TABS.PRODUCT)}>
          <AppText
            style={[
              styles.tabText,
              activeTab === TABS.PRODUCT && styles.activeTabText,
              isRTL && styles.textRTL,
            ]}>
            {t('MyRequests.productTab')}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading && !refreshing && currentRequests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.deepBlue} />
        </View>
      ) : (
        <FlatList
          data={currentRequests}
          renderItem={renderRequestCard}
          keyExtractor={item => item._id}
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
          onEndReached={currentRequests.length > 0 ? loadMore : null}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </GradientWrapper>
  );
};

export default MyRequests;

const styles = StyleSheet.create({
  heading: {
    fontSize: scale(20),
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    gap: scale(12),
  },
  tab: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.deepBlue,
  },
  tabText: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: colors.neutralDark,
    ...primaryFont('500'),
  },
  activeTabText: {
    color: colors.white,
  },
  listContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
    gap: scale(15),
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
    fontSize: fontScale(16),
    color: colors.neutralDark,
  },
  footerLoader: {
    paddingVertical: scale(20),
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(12),
    gap: scale(12),
  },
  cardTopLeft: {
    flex: 1,
  },
  cardTopRight: {
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: fontScale(14),
    color: colors.neutralDark,
    marginBottom: scale(4),
    ...primaryFont('500'),
  },
  cardTitle: {
    fontSize: fontScale(16),
    color: colors.deepBlue,
    ...primaryFont('500'),
  },
  descriptionSection: {
    marginBottom: scale(12),
  },
  description: {
    fontSize: fontScale(16),
    color: colors.neutralDark,
    marginTop: scale(4),
    ...primaryFont('500'),
  },
  dateText: {
    fontSize: fontScale(12),
    color: colors.neutralDark,
    ...primaryFont('400'),
  },
  expandText: {
    fontSize: fontScale(12),
    color: colors.deepBlue,
    fontWeight: '500',
    marginTop: scale(4),
    ...primaryFont('500'),
  },
  statusBanner: {
    marginHorizontal: scale(-16),
    marginBottom: scale(-16),
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: fontScale(14),
    fontWeight: '600',
    textTransform: 'capitalize',
    ...primaryFont('600'),
  },
});
