import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Thunk} from '../apptypes';
import {RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {types} from '../utils/sdkLoader';
import {
  ListingTypes,
  TransactionProcessAlias,
  UnitType,
} from '../apptypes/interfaces/listing';
import {addMarketplaceEntities} from './marketplaceData.slice';

interface ProductImage {
  id: string;
  url: string;
}

interface CreateProductState {
  createProductError: any;
  createProductInProgress: boolean;
  imageUploadingInProgress: boolean;
  uploadImageError: any;
  uploadedImages: ProductImage[];
  submittedProductId: string | null;
  fetchListingInProgress: boolean;
  fetchListingError: any;
}

const initialState: CreateProductState = {
  createProductError: null,
  createProductInProgress: false,
  imageUploadingInProgress: false,
  uploadImageError: null,
  uploadedImages: [],
  submittedProductId: null,
  fetchListingInProgress: false,
  fetchListingError: null,
};

const createProductSlice = createSlice({
  name: 'createProduct',
  initialState,
  reducers: {
    resetCreateProduct: () => {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder.addCase(requestCreateProduct.pending, state => {
      state.createProductInProgress = true;
      state.createProductError = null;
      state.submittedProductId = null;
    });
    builder.addCase(requestCreateProduct.fulfilled, (state, {payload}) => {
      state.createProductInProgress = false;
      state.submittedProductId = payload.data.id.uuid;
    });
    builder.addCase(requestCreateProduct.rejected, (state, {payload}) => {
      state.createProductInProgress = false;
      state.createProductError = payload;
    });
    builder.addCase(requestProductImageUpload.pending, state => {
      state.imageUploadingInProgress = true;
      state.uploadImageError = null;
    });
    builder.addCase(requestProductImageUpload.fulfilled, (state, {payload}) => {
      state.imageUploadingInProgress = false;
      state.uploadedImages.push(payload);
    });
    builder.addCase(requestProductImageUpload.rejected, (state, {payload}) => {
      state.imageUploadingInProgress = false;
      state.uploadImageError = payload;
    });
    builder.addCase(fetchProductListing.pending, state => {
      state.fetchListingInProgress = true;
      state.fetchListingError = null;
    });
    builder.addCase(fetchProductListing.fulfilled, state => {
      state.fetchListingInProgress = false;
    });
    builder.addCase(fetchProductListing.rejected, (state, {payload}) => {
      state.fetchListingInProgress = false;
      state.fetchListingError = payload;
    });
    builder.addCase(requestUpdateProduct.pending, state => {
      state.createProductInProgress = true;
      state.createProductError = null;
    });
    builder.addCase(requestUpdateProduct.fulfilled, (state, {payload}) => {
      state.createProductInProgress = false;
      state.submittedProductId = payload.data.id.uuid;
    });
    builder.addCase(requestUpdateProduct.rejected, (state, {payload}) => {
      state.createProductInProgress = false;
      state.createProductError = payload;
    });
  },
});

// Thunks
export const requestCreateProduct = createAsyncThunk<any, any, Thunk>(
  'createProduct/requestCreateProductStatus',
  async (productData, {rejectWithValue, extra: sdk}) => {
    try {
      const {title, description, price, stock, images} = productData;

      const publicData: any = {
        listingType: ListingTypes.PRODUCT,
        transactionProcessAlias: TransactionProcessAlias.PURCHASE,
        unitType: UnitType.ITEM,
        pickupEnabled: true,
        shippingEnabled: true,
      };

      // Create the listing first
      const response = await sdk.ownListings.create({
        title,
        description,
        price: new types.Money(Math.round(price * 100), 'SAR'),
        publicData,
        images: images || [],
      });

      // Then set the stock separately
      // For newly created listings, oldTotal should be null (not 0)
      const listingId = response.data.data.id;
      if (stock > 0) {
        await sdk.stock.compareAndSet(
          {
            listingId,
            oldTotal: null as any, // null for new listings that never had stock
            newTotal: stock,
          },
          {expand: true},
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('SDK Error creating product:', error);
      console.error('Error details:', error.data);
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to create product',
        ),
      );
    }
  },
);

export const requestUpdateProduct = createAsyncThunk<any, any, Thunk>(
  'createProduct/requestUpdateProductStatus',
  async (productData, {dispatch, rejectWithValue, extra: sdk}) => {
    try {
      const {listingId, title, description, price, stock, images, oldStock} =
        productData;

      const publicData: any = {
        listingType: ListingTypes.PRODUCT,
        transactionProcessAlias: TransactionProcessAlias.PURCHASE,
        unitType: UnitType.ITEM,
        pickupEnabled: true,
        shippingEnabled: true,
      };

      // Update the listing
      await sdk.ownListings.update({
        id: listingId,
        title,
        description,
        price: new types.Money(Math.round(price * 100), 'SAR'),
        publicData,
        images: images || [],
      });

      // Update stock if it changed
      if (stock !== oldStock && stock >= 0) {
        await sdk.stock.compareAndSet(
          {
            listingId,
            oldTotal: oldStock,
            newTotal: stock,
          },
          {expand: true},
        );
      }

      // Fetch the updated listing with includes for denormalization
      const response = await sdk.ownListings.show({
        id: listingId,
        include: ['author', 'images', 'currentStock'],
      } as any);

      // Update the listing in Redux store
      dispatch(addMarketplaceEntities({sdkResponse: response}));

      return response.data;
    } catch (error: any) {
      console.error('SDK Error updating product:', error);
      console.error('Error details:', error.data);
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to update product',
        ),
      );
    }
  },
);

export const requestProductImageUpload = createAsyncThunk<any, any, Thunk>(
  'createProduct/requestProductImageUploadStatus',
  async (actionPayload, {rejectWithValue, extra: sdk}) => {
    try {
      const {file} = actionPayload;

      const response = await sdk.images.upload({
        image: file,
      });

      return {
        id: response.data.data.id.uuid,
        url: response.data.data.attributes.variants.default.url,
      };
    } catch (error: any) {
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to upload image',
        ),
      );
    }
  },
);

export const fetchProductListing = createAsyncThunk<any, any, Thunk>(
  'createProduct/fetchProductListingStatus',
  async (actionPayload, {dispatch, extra: sdk}) => {
    try {
      const {id} = actionPayload;

      const queryParams = {
        id,
        include: ['author', 'images', 'currentStock'],
      };

      const response = await sdk.ownListings.show(queryParams as any);
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response;
    } catch (error: any) {
      console.error('Error fetching product listing:', error);
      throw storableError(
        error.data?.message || error.message || 'Failed to fetch listing',
      );
    }
  },
);

// Selectors
export const createProductInProgressSelector = (state: RootState) =>
  state.createProduct.createProductInProgress;
export const imageUploadingInProgressSelector = (state: RootState) =>
  state.createProduct.imageUploadingInProgress;
export const submittedProductIdSelector = (state: RootState) =>
  state.createProduct.submittedProductId;
export const fetchListingInProgressSelector = (state: RootState) =>
  state.createProduct.fetchListingInProgress;
export const fetchListingErrorSelector = (state: RootState) =>
  state.createProduct.fetchListingError;

export const {resetCreateProduct} = createProductSlice.actions;

export default createProductSlice.reducer;
