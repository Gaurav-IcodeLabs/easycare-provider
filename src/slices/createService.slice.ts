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
import {denormalisedResponseEntities} from '../utils/data';

interface ServiceImage {
  id: string;
  url: string;
}

interface ServiceData {
  categoryId: string;
  subcategoryId: string;
  subsubcategoryId: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  locationType: string;
  customAttributes: Record<string, any>;
}

interface AvailabilityData {
  weeklySchedule: any;
  timezone: string;
  exceptions: any[];
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
  // New availability-related state
  updateAvailabilityInProgress: boolean;
  updateAvailabilityError: any;
  fetchAvailabilityInProgress: boolean;
  fetchAvailabilityError: any;
  // Service form data
  serviceData: ServiceData | null;
  availabilityData: AvailabilityData | null;
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
  // New availability-related state
  updateAvailabilityInProgress: false,
  updateAvailabilityError: null,
  fetchAvailabilityInProgress: false,
  fetchAvailabilityError: null,
  // Service form data
  serviceData: null,
  availabilityData: null,
};

// Thunks defined before slice to avoid reference errors

// Create service thunk
export const requestCreateService = createAsyncThunk<any, any, Thunk>(
  'createService/requestCreateServiceStatus',
  async (serviceData, {rejectWithValue, dispatch, extra: sdk}) => {
    try {
      const {
        categoryId,
        subcategoryId,
        subsubcategoryId,
        title,
        description,
        price,
        duration,
        locationType,
        images,
        customAttributes,
        categoryConfig,
        subcategoryConfig,
        subsubcategoryConfig,
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
        },
        subsubcategory: {
          id: subsubcategoryConfig.id,
          name: subsubcategoryConfig.name,
          slug: subsubcategoryConfig.slug,
          basePrice: subsubcategoryConfig.basePrice,
          currency: subsubcategoryConfig.currency,
          pricingModel: subsubcategoryConfig.pricingModel,
          estimatedDuration: subsubcategoryConfig.estimatedDuration,
        },
        selectedAttributes: {},
      };

      // Add selected attributes with their pricing information
      if (customAttributes && Object.keys(customAttributes).length > 0) {
        Object.entries(customAttributes).forEach(
          ([attrKey, attrValue]: [string, any]) => {
            const attributeConfig = subsubcategoryConfig.attributes[attrKey];

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
        subsubcategory: subsubcategoryId,
        duration,
        locationType,
        serviceConfig, // Store complete config for checkout calculations
      };

      // Create the listing using Sharetribe SDK
      const createParams: any = {
        title,
        description,
        price: new types.Money(Math.round(price * 100), 'SAR'), // Convert to cents
        publicData,
        images: images || [],
      };

      const response = await sdk.ownListings.create(createParams);

      // Add the newly created listing to Redux store
      dispatch(addMarketplaceEntities({sdkResponse: response}));

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

// Update service thunk
export const requestUpdateService = createAsyncThunk<any, any, Thunk>(
  'createService/requestUpdateServiceStatus',
  async (serviceData, {rejectWithValue, extra: sdk, dispatch}) => {
    try {
      const {
        listingId,
        categoryId,
        subcategoryId,
        subsubcategoryId,
        title,
        description,
        price,
        duration,
        locationType,
        images,
        customAttributes,
        categoryConfig,
        subcategoryConfig,
        subsubcategoryConfig,
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
        },
        subsubcategory: {
          id: subsubcategoryConfig.id,
          name: subsubcategoryConfig.name,
          slug: subsubcategoryConfig.slug,
          basePrice: subsubcategoryConfig.basePrice,
          currency: subsubcategoryConfig.currency,
          pricingModel: subsubcategoryConfig.pricingModel,
          estimatedDuration: subsubcategoryConfig.estimatedDuration,
        },
        selectedAttributes: {},
      };

      // Add selected attributes with their pricing information
      if (customAttributes && Object.keys(customAttributes).length > 0) {
        Object.entries(customAttributes).forEach(
          ([attrKey, attrValue]: [string, any]) => {
            const attributeConfig = subsubcategoryConfig.attributes[attrKey];

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
        subsubcategory: subsubcategoryId,
        duration,
        locationType,
        serviceConfig,
      };

      // Update the listing using Sharetribe SDK
      const updateParams: any = {
        id: listingId,
        title,
        description,
        price: new types.Money(Math.round(price * 100), 'SAR'),
        publicData,
        images: images || [],
      };

      const response = await sdk.ownListings.update(updateParams);

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

// Image upload thunk
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

// Fetch service listing thunk
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

      // Denormalize the response to get listing with images included
      const denormalizedListings = denormalisedResponseEntities(response);
      const listing = denormalizedListings[0];

      if (listing) {
        const {attributes} = listing;
        const {publicData, title, description, price} = attributes;

        // Extract service data from publicData
        const serviceConfig = publicData?.serviceConfig || {};
        const categoryId = serviceConfig?.category?.id || '';
        const subcategoryId = serviceConfig?.subcategory?.id || '';
        const subsubcategoryId = serviceConfig?.subsubcategory?.id || '';

        // Extract availability data - will be handled separately in step 2
        let weeklySchedule = null;
        let timezone = 'Asia/Riyadh';
        let exceptions: any[] = [];

        // Note: Availability and exceptions will be fetched separately in step 2

        // Extract custom attributes
        const customAttributes: Record<string, any> = {};
        if (serviceConfig.selectedAttributes) {
          Object.entries(serviceConfig.selectedAttributes).forEach(
            ([attrKey, attrValue]: [string, any]) => {
              customAttributes[attrKey] = attrValue.selectedOptions || {};
            },
          );
        }

        const processedData = {
          categoryId,
          subcategoryId,
          subsubcategoryId,
          title: title || '',
          description: description || '',
          price: price ? (price.amount / 100).toString() : '',
          duration: publicData?.duration?.toString() || '',
          locationType: publicData?.locationType || '',
          customAttributes,
          weeklySchedule,
          timezone,
          exceptions,
        };

        return {
          rawResponse: response,
          processedData,
          serviceData: {
            categoryId,
            subcategoryId,
            subsubcategoryId,
            title: title || '',
            description: description || '',
            price: price ? (price.amount / 100).toString() : '',
            duration: publicData?.duration?.toString() || '',
            locationType: publicData?.locationType || '',
            customAttributes,
          },
          availabilityData: {
            weeklySchedule,
            timezone,
            exceptions,
          },
        };
      }

      return {
        rawResponse: response,
        processedData: null,
        serviceData: null,
        availabilityData: null,
      };
    } catch (error: any) {
      console.error('Error fetching service listing:', error);
      throw storableError(
        error.data?.message || error.message || 'Failed to fetch listing',
      );
    }
  },
);

// Fetch service availability thunk
export const fetchServiceAvailability = createAsyncThunk<any, any, Thunk>(
  'createService/fetchServiceAvailabilityStatus',
  async (actionPayload, {extra: sdk}) => {
    try {
      const {listingId} = actionPayload;

      console.log(
        '📅 Fetching service availability for listing:',
        listingId.uuid,
      );

      // Fetch the listing to get availability plan
      const listingResponse = await sdk.ownListings.show({
        id: listingId,
        include: ['availabilityPlan'],
      });

      const availabilityPlan =
        listingResponse.data.data.attributes.availabilityPlan;
      console.log('📅 Availability plan:', availabilityPlan);

      // Fetch availability exceptions
      let exceptions: any[] = [];
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const oneYearFromNow = new Date();
        oneYearFromNow.setDate(oneYearFromNow.getDate() + 335);

        const exceptionsResponse = await sdk.availabilityExceptions.query({
          listingId,
          start: thirtyDaysAgo,
          end: oneYearFromNow,
        });

        exceptions = exceptionsResponse.data.data || [];
        console.log(`✅ Found ${exceptions.length} service exceptions`);
      } catch (error: any) {
        console.error('❌ Error fetching service exceptions:', error);
        exceptions = [];
      }

      return {
        availabilityPlan,
        exceptions,
        listingId: listingId.uuid,
      };
    } catch (error: any) {
      console.error('❌ Error fetching service availability:', error);
      throw storableError(
        error.data?.message ||
          error.message ||
          'Failed to fetch service availability',
      );
    }
  },
);

// Update service availability thunk
export const requestUpdateServiceAvailability = createAsyncThunk<
  any,
  any,
  Thunk
>(
  'createService/requestUpdateServiceAvailabilityStatus',
  async (availabilityData, {rejectWithValue, extra: sdk}) => {
    try {
      const {listingId, availabilityPlan, exceptions} = availabilityData;

      console.log(
        '📅 Updating service availability for listing:',
        listingId.uuid,
      );
      console.log(
        '📅 Availability plan:',
        JSON.stringify(availabilityPlan, null, 2),
      );
      console.log('📅 Exceptions:', JSON.stringify(exceptions, null, 2));

      // Update the listing with availability plan
      if (availabilityPlan) {
        console.log('1️⃣ Updating availability plan...');
        await sdk.ownListings.update({
          id: listingId,
          availabilityPlan,
        });
        console.log('✅ Availability plan updated');
      }

      // Handle exceptions - always clean up existing ones first
      console.log('2️⃣ Managing availability exceptions...');

      try {
        // First, delete existing exceptions to avoid overlaps
        console.log('🗑️ Deleting existing exceptions...');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const oneYearFromNow = new Date();
        oneYearFromNow.setDate(oneYearFromNow.getDate() + 335);

        const existingExceptions = await sdk.availabilityExceptions.query({
          listingId,
          start: thirtyDaysAgo,
          end: oneYearFromNow,
        });

        const existingExceptionsList = existingExceptions.data.data || [];
        console.log(
          `Found ${existingExceptionsList.length} existing exceptions`,
        );

        if (existingExceptionsList.length > 0) {
          for (const existingException of existingExceptionsList) {
            console.log(`🗑️ Deleting exception: ${existingException.id.uuid}`);
            await sdk.availabilityExceptions.delete({
              id: existingException.id,
            });
          }
          console.log('✅ Existing exceptions deleted');
        }

        // Then add new exceptions (if any)
        if (exceptions && exceptions.length > 0) {
          console.log(`📅 Creating ${exceptions.length} new exceptions...`);
          for (const exception of exceptions) {
            console.log('Creating service exception:', exception);
            await sdk.availabilityExceptions.create(exception);
          }
          console.log('✅ Service exceptions created successfully');
        } else {
          console.log('ℹ️ No new exceptions to create');
        }
      } catch (exceptionError: any) {
        console.error('❌ Error updating service exceptions:', exceptionError);
        // Don't fail the entire update if exceptions fail
      }

      return {
        success: true,
        listingId: listingId.uuid,
        message: 'Service availability updated successfully',
      };
    } catch (error: any) {
      console.error('❌ Error updating service availability:', error);
      console.error('Error details:', error.data || error.message);
      return rejectWithValue(
        storableError(
          error.data?.message ||
            error.message ||
            'Failed to update service availability',
        ),
      );
    }
  },
);

const createServiceSlice = createSlice({
  name: 'createService',
  initialState,
  reducers: {
    resetCreateService: () => {
      return initialState;
    },
    resetFormData: state => {
      state.serviceData = null;
      state.availabilityData = null;
    },
    setSelectedCategory: (state, {payload}) => {
      state.selectedCategory = payload;
      state.selectedSubcategory = null; // Reset subcategory when category changes
    },
    setSelectedSubcategory: (state, {payload}) => {
      state.selectedSubcategory = payload;
    },
    setServiceData: (state, {payload}) => {
      state.serviceData = payload;
    },
    updateServiceData: (state, {payload}) => {
      state.serviceData = state.serviceData
        ? {...state.serviceData, ...payload}
        : payload;
    },
    setAvailabilityData: (state, {payload}) => {
      state.availabilityData = payload;
    },
    updateAvailabilityData: (state, {payload}) => {
      state.availabilityData = state.availabilityData
        ? {...state.availabilityData, ...payload}
        : payload;
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
    builder.addCase(fetchServiceListing.fulfilled, (state, {payload}) => {
      state.fetchListingInProgress = false;
      if (payload.serviceData) {
        state.serviceData = payload.serviceData;
      }
      if (payload.availabilityData) {
        state.availabilityData = payload.availabilityData;
      }
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
    // Availability thunks
    builder.addCase(fetchServiceAvailability.pending, state => {
      state.fetchAvailabilityInProgress = true;
      state.fetchAvailabilityError = null;
    });
    builder.addCase(fetchServiceAvailability.fulfilled, (state, {payload}) => {
      state.fetchAvailabilityInProgress = false;
      if (payload.availabilityPlan || payload.exceptions) {
        // Convert to UI format and store in state
        let weeklySchedule = null;
        let timezone = 'Asia/Riyadh';
        let exceptions: any[] = [];

        if (payload.availabilityPlan) {
          // Note: Conversion will be handled in the component
          weeklySchedule = payload.availabilityPlan;
        }

        if (payload.exceptions && payload.exceptions.length > 0) {
          exceptions = payload.exceptions;
        }

        state.availabilityData = {
          weeklySchedule,
          timezone,
          exceptions,
        };
      }
    });
    builder.addCase(fetchServiceAvailability.rejected, (state, {payload}) => {
      state.fetchAvailabilityInProgress = false;
      state.fetchAvailabilityError = payload;
    });
    builder.addCase(requestUpdateServiceAvailability.pending, state => {
      state.updateAvailabilityInProgress = true;
      state.updateAvailabilityError = null;
    });
    builder.addCase(requestUpdateServiceAvailability.fulfilled, state => {
      state.updateAvailabilityInProgress = false;
    });
    builder.addCase(
      requestUpdateServiceAvailability.rejected,
      (state, {payload}) => {
        state.updateAvailabilityInProgress = false;
        state.updateAvailabilityError = payload;
      },
    );
  },
});

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
export const updateAvailabilityInProgressSelector = (state: RootState) =>
  state.createService.updateAvailabilityInProgress;
export const updateAvailabilityErrorSelector = (state: RootState) =>
  state.createService.updateAvailabilityError;
export const fetchAvailabilityInProgressSelector = (state: RootState) =>
  state.createService.fetchAvailabilityInProgress;
export const fetchAvailabilityErrorSelector = (state: RootState) =>
  state.createService.fetchAvailabilityError;
export const serviceDataSelector = (state: RootState) =>
  state.createService.serviceData;
export const availabilityDataSelector = (state: RootState) =>
  state.createService.availabilityData;

export const {
  resetCreateService,
  resetFormData,
  setSelectedCategory,
  setSelectedSubcategory,
  setServiceData,
  updateServiceData,
  setAvailabilityData,
  updateAvailabilityData,
} = createServiceSlice.actions;

export default createServiceSlice.reducer;
