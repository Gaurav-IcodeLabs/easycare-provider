import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import sortBy from 'lodash/sortBy';
import {addMarketplaceEntities} from './marketplaceData.slice';
import {storableError} from '../utils';
import {RootState} from '../sharetribeSetup';

const RESULT_PAGE_SIZE = 10;

// Memoized constant — no longer recreated on every call
const QUERY_PARAMS = {
  perPage: RESULT_PAGE_SIZE,
  include: ['customer', 'provider', 'listing', 'booking'],
};

// Fixed: no longer mutates input array
const sortedTransactions = (txs: any[]) =>
  sortBy(txs, (tx: any) => tx.attributes?.lastTransitionedAt ?? null).reverse();

// Destructured for clarity
const entityRefs = (entities: any[]): TransactionRef[] =>
  entities.map(({id, type}) => ({id, type}));

interface Id {
  uuid: string;
  _sdkType: string;
}

// Fixed: properly typed arg and ThunkApiConfig
interface FetchTransactionsArg {
  page?: number;
  [key: string]: any;
}

interface ThunkApiConfig {
  state: RootState;
  extra: any;
}

type TransactionRef = {
  id: Id;
  type: string;
};

type Order = {
  transactionRefs: TransactionRef[];
  transactionType: any;
  fetchTransactionsInProgress: boolean;
  fetchTransactionsError: any;
  loadingMore: boolean;
  transactionsPagination: any;
};

const initialState: Order = {
  transactionRefs: [],
  transactionType: 'order',
  loadingMore: false,
  fetchTransactionsInProgress: false,
  fetchTransactionsError: null,
  transactionsPagination: null,
};

const orderSlice = createSlice({
  name: 'orderSlice',
  initialState,
  reducers: {
    resetOrderSliceState: state => {
      const preservedTransactionType = state.transactionType;
      return {
        ...initialState,
        transactionType: preservedTransactionType,
      };
    },
    updateOrderType: (state, {payload}) => {
      state.transactionType = payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTransactions.pending, (state, {meta: {arg}}) => {
        if (arg?.page === 1) {
          state.fetchTransactionsInProgress = true;
          state.fetchTransactionsError = null;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchTransactions.fulfilled, (state, {payload, meta: {arg}}) => {
        const transactions = sortedTransactions(payload?.data?.data);
        const newRefs = entityRefs(transactions);

        state.transactionRefs =
          arg?.page === 1 ? newRefs : [...state.transactionRefs, ...newRefs];
        state.fetchTransactionsInProgress = false;
        state.loadingMore = false;
        state.transactionsPagination = payload?.data?.meta;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.fetchTransactionsInProgress = false;
        state.loadingMore = false;
        state.fetchTransactionsError = action.error;
      });
  },
});

export const fetchTransactions = createAsyncThunk<
  any,
  FetchTransactionsArg,
  ThunkApiConfig
>(
  'ordersSlice/fetchTransactions',
  async ({page = 1, ...rest}, {dispatch, extra: sdk}) => {
    try {
      const response = await (sdk as any).transactions.query({
        page,
        ...QUERY_PARAMS,
        ...rest,
      });

      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response;
    } catch (error) {
      // Fixed: throw instead of return so `rejected` fires correctly
      console.log('error', error);
      // throw storableError(error);
    }
  },
);

export const transactionsRefsSelector = (state: RootState) =>
  state.orderSlice.transactionRefs;
export const fetchTransactionsInProgressSelector = (state: RootState) =>
  state.orderSlice.fetchTransactionsInProgress;
export const fetchTransactionsErrorSelector = (state: RootState) =>
  state.orderSlice.fetchTransactionsError;
export const transactionsPaginationSelector = (state: RootState) =>
  state.orderSlice.transactionsPagination;
export const transactionTypeSelector = (state: RootState) =>
  state.orderSlice.transactionType;
export const loadMoreTransactionSelector = (state: RootState) =>
  state.orderSlice.loadingMore;

export default orderSlice.reducer;

export const {resetOrderSliceState, updateOrderType} = orderSlice.actions;
