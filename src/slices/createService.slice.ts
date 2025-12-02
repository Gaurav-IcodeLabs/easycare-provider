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

interface ServiceImage {
  id: string;
  url: string;
}

interface CreateServiceState {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  createServiceError: any;
  createServiceInProgress: boolean;
  imageUploadingInProgress: boolean;
  uploadImageError: any;
  uploadedImages: ServiceImage[];
  submittedServiceId: string | null;
  fetchListingInProgress: boolean;
  fetchListingError: any;
}

const initialState: CreateServiceState = {
  selectedCategory: null,
  selectedSubcategory: null,
  createServiceError: null,
  createServiceInProgress: false,
  imageUploadingInProgress: false,
  uploadImageError: null,
  uploadedImages: [],
  submittedServiceId: null,
  fetchListingInProgress: false,
  fetchListingError: null,
};

const createServiceSlice = createSlice({
  name: 'createService',
  initialState,
  reducers: {
    resetCreateService: () => {
      return initialState;
    },
    setSelectedCategory: (state, {payload}) => {
      state.selectedCategory = payload;
      state.selectedSubcategory = null; // Reset subcategory when category changes
    },
    setSelectedSubcategory: (state, {payload}) => {
      state.selectedSubcategory = payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(requestCreateService.pending, state => {
      state.createServiceInProgress = true;
      state.createServiceError = null;
      state.submittedServiceId = null;
    });
    builder.addCase(requestCreateService.fulfilled, (state, {payload}) => {
      state.createServiceInProgress = false;
      state.submittedServiceId = payload.data.id.uuid;
    });
    builder.addCase(requestCreateService.rejected, (state, {payload}) => {
      state.createServiceInProgress = false;
      state.createServiceError = payload;
    });
    builder.addCase(requestServiceImageUpload.pending, state => {
      state.imageUploadingInProgress = true;
      state.uploadImageError = null;
    });
    builder.addCase(requestServiceImageUpload.fulfilled, (state, {payload}) => {
      state.imageUploadingInProgress = false;
      state.uploadedImages.push(payload);
    });
    builder.addCase(requestServiceImageUpload.rejected, (state, {payload}) => {
      state.imageUploadingInProgress = false;
      state.uploadImageError = payload;
    });
    builder.addCase(fetchServiceListing.pending, state => {
      state.fetchListingInProgress = true;
      state.fetchListingError = null;
    });
    builder.addCase(fetchServiceListing.fulfilled, state => {
      state.fetchListingInProgress = false;
    });
    builder.addCase(fetchServiceListing.rejected, (state, {payload}) => {
      state.fetchListingInProgress = false;
      state.fetchListingError = payload;
    });
    builder.addCase(requestUpdateService.pending, state => {
      state.createServiceInProgress = true;
      state.createServiceError = null;
    });
    builder.addCase(requestUpdateService.fulfilled, (state, {payload}) => {
      state.createServiceInProgress = false;
      state.submittedServiceId = payload.data.id.uuid;
    });
    builder.addCase(requestUpdateService.rejected, (state, {payload}) => {
      state.createServiceInProgress = false;
      state.createServiceError = payload;
    });
  },
});

// Thunks
export const requestCreateService = createAsyncThunk<any, any, Thunk>(
  'createService/requestCreateServiceStatus',
  async (serviceData, {rejectWithValue, extra: sdk}) => {
    try {
      const {
        categoryId,
        subcategoryId,
        title,
        description,
        price,
        duration,
        locationType,
        images,
        customAttributes,
        categoryConfig,
        subcategoryConfig,
      } = serviceData;

      // Build serviceConfig with all pricing information
      const serviceConfig: any = {
        category: {
          id: categoryConfig.id,
          name: categoryConfig.name,
          slug: categoryConfig.slug,
        },
        subcategory: {
          id: subcategoryConfig.id,
          name: subcategoryConfig.name,
          slug: subcategoryConfig.slug,
          basePrice: subcategoryConfig.basePrice,
          currency: subcategoryConfig.currency,
          pricingModel: subcategoryConfig.pricingModel,
          estimatedDuration: subcategoryConfig.estimatedDuration,
        },
        selectedAttributes: {},
      };

      // Add selected attributes with their pricing information
      if (customAttributes && Object.keys(customAttributes).length > 0) {
        Object.entries(customAttributes).forEach(
          ([attrKey, attrValue]: [string, any]) => {
            const attributeConfig = subcategoryConfig.attributes[attrKey];

            serviceConfig.selectedAttributes[attrKey] = {
              type: attributeConfig.type,
              required: attributeConfig.required,
              label: attributeConfig.label,
              selectedOptions: {},
            };

            // Add selected options with their pricing
            Object.entries(attrValue).forEach(
              ([optionKey, optionData]: [string, any]) => {
                serviceConfig.selectedAttributes[attrKey].selectedOptions[
                  optionKey
                ] = {
                  value: optionData.value,
                  label: optionData.label,
                  priceModifier: optionData.priceModifier || 0,
                };
              },
            );
          },
        );
      }

      // Prepare public data for the listing
      const publicData: any = {
        listingType: ListingTypes.SERVICE,
        transactionProcessAlias: TransactionProcessAlias.BOOKING,
        unitType: UnitType.HOUR,
        category: categoryId,
        subcategory: subcategoryId,
        duration,
        locationType,
        serviceConfig, // Store complete config for checkout calculations
      };

      // Create the listing using Sharetribe SDK
      const response = await sdk.ownListings.create({
        title,
        description,
        price: new types.Money(Math.round(price * 100), 'SAR'), // Convert to cents
        publicData,
        images: images || [],
      });

      return response.data;
    } catch (error: any) {
      console.error('SDK Error creating service:', error);
      console.error('SDK Error data:', error.data);
      console.error('SDK Error status:', error.status);
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to create service',
        ),
      );
    }
  },
);

export const requestServiceImageUpload = createAsyncThunk<any, any, Thunk>(
  'createService/requestServiceImageUploadStatus',
  async (actionPayload, {rejectWithValue, extra: sdk}) => {
    try {
      const {file} = actionPayload;

      // Upload image using Sharetribe SDK
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

// Fetch service listing for editing
export const fetchServiceListing = createAsyncThunk<any, any, Thunk>(
  'createService/fetchServiceListingStatus',
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
      console.error('Error fetching service listing:', error);
      throw storableError(
        error.data?.message || error.message || 'Failed to fetch listing',
      );
    }
  },
);

// Update service listing
export const requestUpdateService = createAsyncThunk<any, any, Thunk>(
  'createService/requestUpdateServiceStatus',
  async (serviceData, {rejectWithValue, extra: sdk, dispatch}) => {
    try {
      const {
        listingId,
        categoryId,
        subcategoryId,
        title,
        description,
        price,
        duration,
        locationType,
        images,
        customAttributes,
        categoryConfig,
        subcategoryConfig,
      } = serviceData;

      // Build serviceConfig with all pricing information
      const serviceConfig: any = {
        category: {
          id: categoryConfig.id,
          name: categoryConfig.name,
          slug: categoryConfig.slug,
        },
        subcategory: {
          id: subcategoryConfig.id,
          name: subcategoryConfig.name,
          slug: subcategoryConfig.slug,
          basePrice: subcategoryConfig.basePrice,
          currency: subcategoryConfig.currency,
          pricingModel: subcategoryConfig.pricingModel,
          estimatedDuration: subcategoryConfig.estimatedDuration,
        },
        selectedAttributes: {},
      };

      // Add selected attributes with their pricing information
      if (customAttributes && Object.keys(customAttributes).length > 0) {
        Object.entries(customAttributes).forEach(
          ([attrKey, attrValue]: [string, any]) => {
            const attributeConfig = subcategoryConfig.attributes[attrKey];

            serviceConfig.selectedAttributes[attrKey] = {
              type: attributeConfig.type,
              required: attributeConfig.required,
              label: attributeConfig.label,
              selectedOptions: {},
            };

            // Add selected options with their pricing
            Object.entries(attrValue).forEach(
              ([optionKey, optionData]: [string, any]) => {
                serviceConfig.selectedAttributes[attrKey].selectedOptions[
                  optionKey
                ] = {
                  value: optionData.value,
                  label: optionData.label,
                  priceModifier: optionData.priceModifier || 0,
                };
              },
            );
          },
        );
      }

      // Prepare public data for the listing
      const publicData: any = {
        listingType: ListingTypes.SERVICE,
        transactionProcessAlias: TransactionProcessAlias.BOOKING,
        unitType: UnitType.HOUR,
        category: categoryId,
        subcategory: subcategoryId,
        duration,
        locationType,
        serviceConfig,
      };

      // Update the listing using Sharetribe SDK
      const response = await sdk.ownListings.update({
        id: listingId,
        title,
        description,
        price: new types.Money(Math.round(price * 100), 'SAR'),
        publicData,
        images: images || [],
      });
      const updated = await sdk.ownListings.show({
        id: listingId,
        include: ['author', 'images', 'currentStock'],
      } as any);

      // Update the listing in Redux store
      dispatch(addMarketplaceEntities({sdkResponse: updated}));

      return response.data;
    } catch (error: any) {
      console.error('SDK Error updating service:', error);
      console.error('SDK Error data:', error.data);
      console.error('SDK Error status:', error.status);
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to update service',
        ),
      );
    }
  },
);

// Selectors
export const selectedCategorySelector = (state: RootState) =>
  state.createService.selectedCategory;
export const selectedSubcategorySelector = (state: RootState) =>
  state.createService.selectedSubcategory;
export const createServiceInProgressSelector = (state: RootState) =>
  state.createService.createServiceInProgress;
export const imageUploadingInProgressSelector = (state: RootState) =>
  state.createService.imageUploadingInProgress;
export const submittedServiceIdSelector = (state: RootState) =>
  state.createService.submittedServiceId;
export const fetchListingInProgressSelector = (state: RootState) =>
  state.createService.fetchListingInProgress;
export const fetchListingErrorSelector = (state: RootState) =>
  state.createService.fetchListingError;

export const {resetCreateService, setSelectedCategory, setSelectedSubcategory} =
  createServiceSlice.actions;

export default createServiceSlice.reducer;
