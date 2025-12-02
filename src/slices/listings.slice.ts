import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Thunk} from '../apptypes';
import {RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {addMarketplaceEntities} from './marketplaceData.slice';
import {ListingState} from '../apptypes/interfaces/listing';

interface PaginationMeta {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

interface ListingsState {
  listingIds: string[];
  pagination: PaginationMeta;
  fetchListingsInProgress: boolean;
  fetchListingsError: any;
  hasMore: boolean;
  currentListingType: string | null;
}

const initialPagination: PaginationMeta = {
  page: 1,
  perPage: 20,
  totalPages: 0,
  totalItems: 0,
};

const initialState: ListingsState = {
  listingIds: [],
  pagination: initialPagination,
  fetchListingsInProgress: false,
  fetchListingsError: null,
  hasMore: true,
  currentListingType: null,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    resetListings: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchListings.pending, state => {
      state.fetchListingsInProgress = true;
      state.fetchListingsError = null;
    });
    builder.addCase(fetchListings.fulfilled, (state, {payload}) => {
      const {listings, meta, isLoadMore, listingType} = payload;
      const listingIds = listings.map((listing: any) => listing.id.uuid);

      if (isLoadMore) {
        state.listingIds = [...state.listingIds, ...listingIds];
      } else {
        state.listingIds = listingIds;
      }

      state.pagination = {
        page: meta.page,
        perPage: meta.perPage,
        totalPages: meta.totalPages,
        totalItems: meta.totalItems,
      };
      state.hasMore = meta.page < meta.totalPages;
      state.currentListingType = listingType;
      state.fetchListingsInProgress = false;
    });
    builder.addCase(fetchListings.rejected, (state, {payload}) => {
      state.fetchListingsInProgress = false;
      state.fetchListingsError = payload;
    });
  },
});

interface FetchListingsParams {
  listingType: string;
  page?: number;
  perPage?: number;
  isLoadMore?: boolean;
}

export const fetchListings = createAsyncThunk<any, FetchListingsParams, Thunk>(
  'listings/fetchListings',
  async (params, {dispatch, extra: sdk}) => {
    const {listingType, page = 1, perPage = 20, isLoadMore = false} = params;

    try {
      const response = await sdk.ownListings.query({
        include: ['author', 'images', 'currentStock'],
        page,
        perPage,
        states: [
          ListingState.LISTING_STATE_PENDING_APPROVAL,
          ListingState.LISTING_STATE_PUBLISHED,
        ],
        pub_listingType: listingType,
      } as any);

      dispatch(addMarketplaceEntities({sdkResponse: response}));

      return {
        listings: response.data.data,
        meta: response.data.meta,
        isLoadMore,
        listingType,
      };
    } catch (error) {
      console.error('fetchListings error:', error);
      throw storableError(error);
    }
  },
);

// Selectors
export const listingIdsSelector = (state: RootState) =>
  state.listings.listingIds;

export const paginationSelector = (state: RootState) =>
  state.listings.pagination;

export const hasMoreSelector = (state: RootState) => state.listings.hasMore;

export const currentListingTypeSelector = (state: RootState) =>
  state.listings.currentListingType;

export const fetchListingsInProgressSelector = (state: RootState) =>
  state.listings.fetchListingsInProgress;

export const fetchListingsErrorSelector = (state: RootState) =>
  state.listings.fetchListingsError;

export const {resetListings} = listingsSlice.actions;

export default listingsSlice.reducer;
