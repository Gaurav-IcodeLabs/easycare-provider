import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Thunk} from '../apptypes';
import {RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {types} from '../utils/sdkLoader';

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

export const {resetCreateService, setSelectedCategory, setSelectedSubcategory} =
  createServiceSlice.actions;

export default createServiceSlice.reducer;
