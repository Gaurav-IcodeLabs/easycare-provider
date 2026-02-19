import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CurrentUser, Thunk, UserState} from '../apptypes';
import {resetAllSlices, RootState} from '../sharetribeSetup';
import {util as sdkUtil, storableError} from '../utils';
import {authInfo} from './auth.slice';
import {addMarketplaceEntities} from './marketplaceData.slice';
import {denormalisedResponseEntities} from '../utils/data';

const currentUserParameters = {
  include: ['profileImage', 'stripeAccount'],
  'fields.image': [
    'variants.square-small',
    'variants.square-small2x',
    'variants.square-xsmall',
    'variants.square-xsmall2x',
  ],
  'imageVariant.square-xsmall': sdkUtil.objectQueryString({
    w: 40,
    h: 40,
    fit: 'crop',
  }),
  'imageVariant.square-xsmall2x': sdkUtil.objectQueryString({
    w: 80,
    h: 80,
    fit: 'crop',
  }),
} as const;

const mergeCurrentUser = (
  oldCurrentUser: CurrentUser | null,
  newCurrentUser: CurrentUser | null,
): CurrentUser | null => {
  if (newCurrentUser === null) {
    return null;
  }

  if (oldCurrentUser === null) {
    return newCurrentUser;
  }

  const {
    id: _oldId,
    type: _oldType,
    attributes: _oldAttributes,
    ...oldRelationships
  } = oldCurrentUser;
  const {
    id: newId,
    type: newType,
    attributes: newAttributes,
    ...relationships
  } = newCurrentUser;

  // Only relationships are merged.
  // TODO figure out if sparse fields handling needs a better handling.
  return {
    id: newId,
    type: newType,
    attributes: newAttributes,
    ...oldRelationships,
    ...relationships,
  };
};

const initialState: UserState = {
  currentUser: null,
  fetchCurrentUserInProgress: false,
  currentUserShowError: null,
  updateCurrentUserError: null,
  updateCurrentUserInProgress: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, {payload}: PayloadAction<CurrentUser | null>) => {
      state.currentUser = mergeCurrentUser(state.currentUser, payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(resetAllSlices, () => initialState);
    builder
      .addCase(fetchCurrentUser.pending, state => {
        state.currentUserShowError = null;
        state.fetchCurrentUserInProgress = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentUser = mergeCurrentUser(
            state.currentUser,
            action.payload,
          );
        } else {
        }
        state.fetchCurrentUserInProgress = false;
        state.currentUserShowError = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentUserShowError = storableError(action.error as any);
        state.fetchCurrentUserInProgress = false;
      })
      .addCase(updateCurrentUser.pending, state => {
        state.updateCurrentUserError = null;
        state.updateCurrentUserInProgress = true;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentUser = mergeCurrentUser(
            state.currentUser,
            action.payload,
          );
        }
        state.updateCurrentUserError = null;
        state.updateCurrentUserInProgress = false;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.updateCurrentUserInProgress = false;
        state.updateCurrentUserError = storableError(action.error as any);
      });
  },
});

export const fetchCurrentUser = createAsyncThunk<
  CurrentUser | undefined,
  Record<string, unknown>,
  Thunk
>(
  'user/fetchCurrentUser',
  async (params = {}, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      const parameters = {...currentUserParameters, ...params} as any;

      const response = await sdk.currentUser.show(parameters);

      if (!response || !response.data) {
        throw new Error('Invalid response from currentUser.show');
      }

      const entities = denormalisedResponseEntities(response);
      dispatch(addMarketplaceEntities({sdkResponse: response}));

      // Handle deleted user
      if (entities[0]?.attributes?.profile?.metadata?.isDeleted === true) {
        await sdk.logout();
        return undefined;
      }

      if (entities.length !== 1) {
        throw new Error(
          'Expected a resource in the sdk.currentUser.show response',
        );
      }

      const currentUser: CurrentUser = entities[0];

      // Make sure auth info is up to date
      dispatch(authInfo());

      return currentUser;
    } catch (error: any) {
      return rejectWithValue({
        message: error?.message || 'Failed to fetch current user',
      });
    }
  },
);

export const updateCurrentUser = createAsyncThunk<
  CurrentUser,
  Record<string, any>,
  Thunk
>(
  'user/updateCurrentUser',
  async (params, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      const res = await sdk.currentUser.updateProfile(params as any, {
        expand: true,
      });

      dispatch(addMarketplaceEntities({sdkResponse: res}));

      const entities = denormalisedResponseEntities(res);
      if (entities.length !== 1) {
        throw new Error(
          'Expected a resource in the sdk.currentUser.updateProfile response',
        );
      }

      const currentUser: CurrentUser = entities[0];
      return currentUser;
    } catch (error: any) {
      return rejectWithValue({
        message: error?.message || 'Failed to update current user',
      });
    }
  },
);

export const changeUserEmail = createAsyncThunk<
  void,
  {currentPassword: string; email: string},
  Thunk
>(
  'user/changeUserEmail',
  async ({currentPassword, email}, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      await sdk.currentUser.changeEmail({
        currentPassword,
        email,
      });

      // Refresh user info after email change
      await dispatch(authInfo());
      await dispatch(fetchCurrentUser({}));
    } catch (error: any) {
      // Handle specific Sharetribe API errors
      if (error?.status === 403) {
        // Forbidden - incorrect password
        return rejectWithValue({
          status: 403,
          message: 'Incorrect current password',
        });
      } else if (error?.status === 409) {
        // Conflict - email already in use
        return rejectWithValue({
          status: 409,
          message: 'Email already in use',
        });
      } else if (error?.status === 422) {
        // Unprocessable Entity - invalid email format or other validation errors
        return rejectWithValue({
          status: 422,
          message: 'Invalid email format',
        });
      }

      return rejectWithValue({
        status: error?.status,
        message: error?.message || 'Failed to change email',
      });
    }
  },
);

export const uploadProfileImage = createAsyncThunk<
  {id: string},
  {file: any},
  Thunk
>('user/uploadProfileImage', async ({file}, {extra: sdk, rejectWithValue}) => {
  try {
    const response = await sdk.images.upload({
      image: file,
    });

    // The response structure is: response.data.data.id.uuid
    const imageId = response.data.data.id.uuid;

    return {
      id: imageId,
    };
  } catch (error: any) {
    return rejectWithValue({
      message: error?.message || 'Failed to upload profile image',
    });
  }
});

export const updateOwnListing = createAsyncThunk<
  any,
  {id: string; publicData?: Record<string, any>; [key: string]: any},
  Thunk
>(
  'user/updateOwnListing',
  async (data, {dispatch, extra: sdk, rejectWithValue}) => {
    try {
      const {id, ...updateData} = data;
      const response = await sdk.ownListings.update(
        {
          id,
          ...updateData,
        },
        {
          expand: true,
          include: ['images'],
        },
      );

      dispatch(addMarketplaceEntities({sdkResponse: response}));

      return response.data;
    } catch (error: any) {
      console.log('updateOwnListing error', error);
      return rejectWithValue({
        message: error?.message || 'Failed to update business listing',
      });
    }
  },
);

export const {setCurrentUser} = userSlice.actions;

export const currentUserSelector = (state: RootState) => state.user.currentUser;
export const currentUserIdSelector = (state: RootState) =>
  state.user.currentUser?.id.uuid;
export const currentUserDisplayNameSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.displayName;
export const fetchCurrentUserInProgressSelector = (state: RootState) =>
  state.user.fetchCurrentUserInProgress;
export const currentUserFirstNameSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.firstName;
export const currentUserLastNameSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.lastName;
export const currentUserProfileImageUrlSelector = (state: RootState) =>
  state.user.currentUser?.profileImage?.attributes?.variants?.['square-small']
    ?.url;

export const currentUserEmailSelector = (state: RootState) =>
  state.user.currentUser?.attributes.email;
export const currentUserPhoneNumberSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.protectedData?.phoneNumber;
export const phoneNumberVerifiedSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.publicData?.phoneNumberVerified ??
  false;
export const businessListingIdSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.publicData?.businessListingId;
export const businessListingSetupCompletedSelector = (state: RootState) =>
  state.user.currentUser?.attributes.profile.publicData
    ?.businessListingSetupCompleted;

// Individual setup step selectors - read from business listing publicData
export const businessProfileSetupCompletedSelector = (state: RootState) => {
  const businessListingId =
    state.user.currentUser?.attributes.profile.publicData?.businessListingId;
  if (!businessListingId) {
    return false;
  }

  const businessListing =
    state.marketplaceData?.entities?.ownListing?.[businessListingId];
  return (
    businessListing?.attributes?.publicData?.businessProfileSetupCompleted ||
    false
  );
};

export const payoutSetupCompletedSelector = (state: RootState) => {
  const businessListingId =
    state.user.currentUser?.attributes.profile.publicData?.businessListingId;
  if (!businessListingId) {
    return false;
  }

  const businessListing =
    state.marketplaceData?.entities?.ownListing?.[businessListingId];
  return businessListing?.attributes?.publicData?.payoutSetupCompleted || false;
};

export const hasIdentityProvidersSelector = (state: RootState) => {
  const identityProviders =
    state.user.currentUser?.attributes.identityProviders;
  return identityProviders && identityProviders.length > 0;
};
export const currentUserEmailVerifiedSelector = (state: RootState) =>
  state.user.currentUser?.attributes.emailVerified;

export default userSlice.reducer;

// export const userSelector = (state: RootState) => state.user;
