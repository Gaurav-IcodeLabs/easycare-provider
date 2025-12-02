import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Thunk} from '../apptypes';
import {RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {addMarketplaceEntities} from './marketplaceData.slice';
import {ListingState} from '../apptypes/interfaces/listing';

interface CategoryListings {
  services: string[];
  products: string[];
}

interface HomeState {
  categoryListings: CategoryListings;
  fetchListingsInProgress: boolean;
  fetchListingsError: any;
}

const initialState: HomeState = {
  categoryListings: {
    services: [],
    products: [],
  },
  fetchListingsInProgress: false,
  fetchListingsError: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    resetHome: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    // Fetch Services
    builder.addCase(fetchServices.pending, state => {
      state.fetchListingsInProgress = true;
      state.fetchListingsError = null;
    });
    builder.addCase(fetchServices.fulfilled, (state, {payload}) => {
      const serviceIds = payload.map((listing: any) => listing.id.uuid);
      state.categoryListings.services = serviceIds;
      state.fetchListingsInProgress = false;
    });
    builder.addCase(fetchServices.rejected, (state, {payload}) => {
      state.fetchListingsInProgress = false;
      state.fetchListingsError = payload;
    });

    // Fetch Products
    builder.addCase(fetchProducts.pending, state => {
      state.fetchListingsInProgress = true;
      state.fetchListingsError = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, {payload}) => {
      const productIds = payload.map((listing: any) => listing.id.uuid);
      state.categoryListings.products = productIds;
      state.fetchListingsInProgress = false;
    });
    builder.addCase(fetchProducts.rejected, (state, {payload}) => {
      state.fetchListingsInProgress = false;
      state.fetchListingsError = payload;
    });
  },
});

// Thunk to fetch services (pending approval or published)
export const fetchServices = createAsyncThunk<any, void, Thunk>(
  'home/fetchServicesStatus',
  async (_, {dispatch, extra: sdk}) => {
    try {
      const response = await sdk.ownListings.query({
        include: ['author', 'images', 'currentStock'],
        perPage: 5,
        states: [
          ListingState.LISTING_STATE_PENDING_APPROVAL,
          ListingState.LISTING_STATE_PUBLISHED,
        ],
        pub_listingType: 'service',
      } as any);
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response.data.data;
    } catch (error) {
      console.error('fetchServices error:', error);
      throw storableError(error);
    }
  },
);

// Thunk to fetch products (pending approval or published)
export const fetchProducts = createAsyncThunk<any, void, Thunk>(
  'home/fetchProductsStatus',
  async (_, {dispatch, extra: sdk}) => {
    try {
      const response = await sdk.ownListings.query({
        include: ['author', 'images', 'currentStock'],
        perPage: 5,
        states: [
          ListingState.LISTING_STATE_PENDING_APPROVAL,
          ListingState.LISTING_STATE_PUBLISHED,
        ],
        pub_listingType: 'product',
      } as any);

      dispatch(addMarketplaceEntities({sdkResponse: response}));

      return response.data.data;
    } catch (error) {
      console.error('fetchProducts error:', error);
      throw storableError(error);
    }
  },
);

// Selectors
export const categoryListingsSelector = (state: RootState) =>
  state.home.categoryListings;

export const serviceIdsSelector = (state: RootState) =>
  state.home.categoryListings.services;

export const productIdsSelector = (state: RootState) =>
  state.home.categoryListings.products;

export const fetchListingsInProgressSelector = (state: RootState) =>
  state.home.fetchListingsInProgress;
export const fetchListingsErrorSelector = (state: RootState) =>
  state.home.fetchListingsError;

export const {resetHome} = homeSlice.actions;

export default homeSlice.reducer;
