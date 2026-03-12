import {FlatList} from 'react-native';
import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useTypedSelector} from '../../sharetribeSetup';
import {
  entitiesSelector,
  getMarketplaceEntities,
} from '../../slices/marketplaceData.slice';
import {AppText, OrderCard} from '../../components';
import {
  fetchTransactions,
  fetchTransactionsInProgressSelector,
  loadMoreTransactionSelector,
  resetOrderSliceState,
  transactionsPaginationSelector,
  transactionsRefsSelector,
} from '../../slices/orders.slice';
import {colors, primaryFont} from '../../constants';
import {scale} from '../../utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const Orders: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const isLoading = useSelector(fetchTransactionsInProgressSelector);
  const loadingMore = useTypedSelector(loadMoreTransactionSelector);
  const pagination = useTypedSelector(transactionsPaginationSelector);
  const transactionRefs = useSelector(transactionsRefsSelector);
  const entities = useTypedSelector(entitiesSelector);
  const transactions = getMarketplaceEntities(entities, transactionRefs);
  const {top, right, left} = useSafeAreaInsets();
  const loadData = () => {
    dispatch(
      fetchTransactions({
        page: 1,
      }),
    );
  };

  const loadMoreData = async () => {
    if (
      !loadingMore &&
      !isLoading &&
      pagination?.page !== pagination?.totalPages
    ) {
      await dispatch(
        fetchTransactions({
          page: pagination?.page + 1,
        }),
      );
    }
  };
  useEffect(() => {
    loadData();
    return () => {
      dispatch(resetOrderSliceState());
    };
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <AppText style={styles.emptyText}>{t('Orders.noOrders')}</AppText>
    </View>
  );

  const _renderFooterLoader = () => {
    return loadingMore && <ActivityIndicator size={'small'} />;
  };

  return (
    <View
      style={[
        styles.container,
        {paddingTop: top, paddingRight: right, paddingLeft: left},
      ]}>
      <AppText style={styles.title}>{t('Orders.heading')}</AppText>

      {isLoading && !transactionRefs.length ? (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !transactionRefs.length ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={transactions}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, i) => i.toString()}
          onEndReached={loadMoreData}
          ListFooterComponent={_renderFooterLoader}
          refreshing={loadingMore || isLoading}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => loadData()}
            />
          }
          renderItem={({item: transaction}) => (
            <OrderCard transaction={transaction} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBlue,
  },
  title: {
    ...primaryFont('500'),
    fontSize: scale(18),
    marginBottom: scale(22),
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...primaryFont('500'),
    fontSize: scale(18),
    color: colors.neutralDark,
    textAlign: 'center',
  },
  initialLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: scale(100),
    paddingHorizontal: scale(20),
  },
});
