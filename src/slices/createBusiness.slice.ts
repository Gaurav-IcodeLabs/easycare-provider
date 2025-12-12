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
import {fetchCurrentUser} from './user.slice';

interface BusinessImage {
  id: string;
  url: string;
}

interface CreateBusinessState {
  createBusinessError: any;
  createBusinessInProgress: boolean;
  imageUploadingInProgress: boolean;
  uploadImageError: any;
  uploadedImages: BusinessImage[];
  submittedBusinessId: string | null;
  fetchListingInProgress: boolean;
  fetchListingError: any;
  currentStep: number;
  draftListingId: string | null;
  businessData: any | null;
}

const initialState: CreateBusinessState = {
  createBusinessError: null,
  createBusinessInProgress: false,
  imageUploadingInProgress: false,
  uploadImageError: null,
  uploadedImages: [],
  submittedBusinessId: null,
  fetchListingInProgress: false,
  fetchListingError: null,
  currentStep: 1,
  draftListingId: null,
  businessData: null,
};

const createBusinessSlice = createSlice({
  name: 'createBusiness',
  initialState,
  reducers: {
    resetCreateBusiness: () => {
      return initialState;
    },
    setCurrentStep: (state, {payload}) => {
      state.currentStep = payload;
    },
    setDraftListingId: (state, {payload}) => {
      state.draftListingId = payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(requestCreateBusinessDraft.pending, state => {
      state.createBusinessInProgress = true;
      state.createBusinessError = null;
    });
    builder.addCase(
      requestCreateBusinessDraft.fulfilled,
      (state, {payload}) => {
        state.createBusinessInProgress = false;
        state.draftListingId = payload.data.id.uuid;
      },
    );
    builder.addCase(requestCreateBusinessDraft.rejected, (state, {payload}) => {
      state.createBusinessInProgress = false;
      state.createBusinessError = payload;
    });
    builder.addCase(requestPublishBusiness.pending, state => {
      state.createBusinessInProgress = true;
      state.createBusinessError = null;
    });
    builder.addCase(requestPublishBusiness.fulfilled, (state, {payload}) => {
      state.createBusinessInProgress = false;
      state.submittedBusinessId = payload.data.id.uuid;
    });
    builder.addCase(requestPublishBusiness.rejected, (state, {payload}) => {
      state.createBusinessInProgress = false;
      state.createBusinessError = payload;
    });
    builder.addCase(requestBusinessImageUpload.pending, state => {
      state.imageUploadingInProgress = true;
      state.uploadImageError = null;
    });
    builder.addCase(
      requestBusinessImageUpload.fulfilled,
      (state, {payload}) => {
        state.imageUploadingInProgress = false;
        state.uploadedImages.push(payload);
      },
    );
    builder.addCase(requestBusinessImageUpload.rejected, (state, {payload}) => {
      state.imageUploadingInProgress = false;
      state.uploadImageError = payload;
    });
    builder.addCase(fetchBusinessListing.pending, state => {
      state.fetchListingInProgress = true;
      state.fetchListingError = null;
    });
    builder.addCase(fetchBusinessListing.fulfilled, (state, {payload}) => {
      state.fetchListingInProgress = false;
      state.businessData = payload;
    });
    builder.addCase(fetchBusinessListing.rejected, (state, {payload}) => {
      state.fetchListingInProgress = false;
      state.fetchListingError = payload;
    });
  },
});

// Thunks
export const requestCreateBusinessDraft = createAsyncThunk<any, any, Thunk>(
  'createBusiness/requestCreateBusinessDraftStatus',
  async (businessData, {dispatch, rejectWithValue, extra: sdk, getState}) => {
    try {
      const {title, description, location, registrationNumber, images} =
        businessData;

      const state = getState() as any;
      const existingBusinessId =
        state.user.currentUser?.attributes?.profile?.publicData
          ?.businessListingId;

      console.log('📝 Existing business ID:', existingBusinessId);

      const publicData: any = {
        listingType: ListingTypes.BUSINESS_PROFILE,
        transactionProcessAlias: TransactionProcessAlias.INQUIRY,
        unitType: UnitType.INQUIRY,
        registrationNumber,
        address: location?.address || '',
      };

      let response;

      if (existingBusinessId) {
        // Update existing draft
        console.log('♻️ Updating existing business draft...');
        response = await sdk.ownListings.update({
          id: existingBusinessId,
          title,
          description,
          geolocation: location
            ? new types.LatLng(location.lat, location.lng)
            : undefined,
          publicData,
          images: images || [],
        });
      } else {
        // Create new draft listing
        console.log('🆕 Creating new business draft...');
        response = await sdk.ownListings.create({
          title,
          description,
          geolocation: location
            ? new types.LatLng(location.lat, location.lng)
            : undefined,
          publicData,
          images: images || [],
        });

        // Save the listing ID to user profile
        const listingId = response.data.data.id.uuid;
        console.log('💾 Saving business ID to user profile:', listingId);

        await sdk.currentUser.updateProfile(
          {
            publicData: {
              businessListingId: listingId,
            },
          },
          {expand: true},
        );
        console.log('✅ Business ID saved to profile');

        // Refetch current user to update Redux store
        await dispatch(fetchCurrentUser({}));
        console.log('✅ Current user refetched with updated profile');
      }

      return response.data;
    } catch (error: any) {
      console.error('SDK Error creating business draft:', error);
      console.error('Error details:', error.data);
      return rejectWithValue(
        storableError(
          error.data?.message ||
            error.message ||
            'Failed to create business draft',
        ),
      );
    }
  },
);

export const requestPublishBusiness = createAsyncThunk<any, any, Thunk>(
  'createBusiness/requestPublishBusinessStatus',
  async (businessData, {dispatch, rejectWithValue, extra: sdk}) => {
    try {
      const {listingId, availabilityPlan, exceptions} = businessData;

      console.log('📅 Publishing with data:', {
        listingId,
        availabilityPlan: JSON.stringify(availabilityPlan, null, 2),
        exceptions: JSON.stringify(exceptions, null, 2),
      });

      // Update the listing with Sharetribe's availability plan
      console.log('1️⃣ Updating availability plan...');
      await sdk.ownListings.update({
        id: listingId,
        availabilityPlan,
      });
      console.log('✅ Plan updated');

      // Delete existing exceptions first to avoid overlaps
      console.log('2️⃣ Fetching existing exceptions to delete...');
      try {
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
          console.log('🗑️ Deleting existing exceptions...');
          for (const existingException of existingExceptionsList) {
            await sdk.availabilityExceptions.delete({
              id: existingException.id,
            });
          }
          console.log('✅ Existing exceptions deleted');
        }
      } catch (error) {
        console.warn('⚠️ Could not delete existing exceptions:', error);
      }

      // Create new availability exceptions if any
      if (exceptions && exceptions.length > 0) {
        console.log(`3️⃣ Creating ${exceptions.length} new exceptions...`);
        for (const exception of exceptions) {
          console.log('Creating exception:', exception);
          await sdk.availabilityExceptions.create(exception);
        }
        console.log('✅ New exceptions created');
      }

      // Check listing state before publishing
      console.log('4️⃣ Checking listing state...');
      const currentListing = await sdk.ownListings.show({
        id: listingId,
      } as any);

      const listingState = currentListing.data.data.attributes.state;
      console.log('Current listing state:', listingState);

      let response;
      if (listingState === 'draft') {
        console.log('5️⃣ Publishing listing (opening draft)...');
        response = await sdk.ownListings.open({
          id: listingId,
        });
        console.log('✅ Published');
      } else if (listingState === 'closed') {
        console.log('5️⃣ Re-opening closed listing...');
        response = await sdk.ownListings.open({
          id: listingId,
        });
        console.log('✅ Re-opened');
      } else {
        console.log('✅ Listing already in published state:', listingState);
        response = currentListing;
      }

      // Fetch the updated listing with includes for denormalization
      const updatedListing = await sdk.ownListings.show({
        id: listingId,
        include: ['author', 'images'],
      } as any);

      // Update the listing in Redux store
      dispatch(addMarketplaceEntities({sdkResponse: updatedListing}));

      return response.data;
    } catch (error: any) {
      console.error('❌ SDK Error:', error);
      console.error('Error data:', JSON.stringify(error.data, null, 2));
      console.error('Error response:', error.response?.data);
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to publish business',
        ),
      );
    }
  },
);

export const requestBusinessImageUpload = createAsyncThunk<any, any, Thunk>(
  'createBusiness/requestBusinessImageUploadStatus',
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

export const fetchBusinessListing = createAsyncThunk<any, any, Thunk>(
  'createBusiness/fetchBusinessListingStatus',
  async (actionPayload, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      const {id} = actionPayload;

      console.log('📥 Fetching business listing:', id);

      // Fetch the listing
      const queryParams = {
        id,
        include: ['author', 'images'],
      };

      const response = await sdk.ownListings.show(queryParams as any);
      dispatch(addMarketplaceEntities({sdkResponse: response}));

      console.log('✅ Business listing fetched');

      // Fetch availability exceptions
      console.log('📅 Fetching availability exceptions for listing:', id);

      // Sharetribe allows max 366 days between start and end
      // Try to fetch exceptions from the past 30 days to 1 year in the future
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const oneYearFromNow = new Date();
      oneYearFromNow.setDate(oneYearFromNow.getDate() + 335); // 30 + 335 = 365 days total

      console.log('📅 Date range:', {
        start: thirtyDaysAgo.toISOString(),
        end: oneYearFromNow.toISOString(),
        daysDifference: Math.ceil(
          (oneYearFromNow.getTime() - thirtyDaysAgo.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      });

      let exceptions: any[] = [];
      try {
        const exceptionsResponse = await sdk.availabilityExceptions.query({
          listingId: id,
          start: thirtyDaysAgo,
          end: oneYearFromNow,
        });

        console.log('📅 Exceptions response:', exceptionsResponse);
        exceptions = exceptionsResponse.data.data || [];
        console.log(`✅ Found ${exceptions.length} exceptions`);

        if (exceptions.length > 0) {
          console.log(
            '📅 Exception details:',
            JSON.stringify(exceptions, null, 2),
          );
        }
      } catch (error: any) {
        console.error('❌ Error fetching exceptions:', error);
        console.error('Error details:', error.data || error.message);
      }

      const result = {
        listing: response.data,
        exceptions,
      };

      console.log('📦 Returning result:', {
        listingId: response.data.data.id.uuid,
        exceptionsCount: exceptions.length,
      });

      return result;
    } catch (error: any) {
      console.error('❌ Error fetching business listing:', error);
      console.error('Error details:', error.data || error.message);
      return rejectWithValue(
        storableError(
          error.data?.message || error.message || 'Failed to fetch listing',
        ),
      );
    }
  },
);

// Selectors
export const createBusinessInProgressSelector = (state: RootState) =>
  state.createBusiness.createBusinessInProgress;
export const imageUploadingInProgressSelector = (state: RootState) =>
  state.createBusiness.imageUploadingInProgress;
export const submittedBusinessIdSelector = (state: RootState) =>
  state.createBusiness.submittedBusinessId;
export const currentStepSelector = (state: RootState) =>
  state.createBusiness.currentStep;
export const draftListingIdSelector = (state: RootState) =>
  state.createBusiness.draftListingId;
export const fetchListingInProgressSelector = (state: RootState) =>
  state.createBusiness.fetchListingInProgress;
export const businessDataSelector = (state: RootState) =>
  state.createBusiness.businessData;

export const {resetCreateBusiness, setCurrentStep, setDraftListingId} =
  createBusinessSlice.actions;

export default createBusinessSlice.reducer;
