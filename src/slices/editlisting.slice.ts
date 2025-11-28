import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Thunk} from '../apptypes';
import {addMarketplaceEntities} from './marketplaceData.slice';
import {RootState} from '../sharetribeSetup';
import {storableError} from '../utils';
import {
  getImageVariantInfo,
  imageIds,
  updateStockOfListingMaybe,
} from '../screens/EditListing/components/helper';

type ListingId = {
  uuid: string;
  _sdkType: string;
} | null;

interface EditListingState {
  selectedListingType: any;
  createListingDraftError: any;
  listingId: ListingId;
  publishListingError: any;
  updateListingError: any;
  showListingsError: any;
  uploadImageError: any;
  setStockError: any;
  setStockInProgress: boolean;
  createListingDraftInProgress: boolean;
  imageUploadingInProgress: boolean;
  publishDraftInProgress: boolean;
  submittedListingId: ListingId;
  redirectToListing: boolean;
  uploadedImages: Record<string, any>;
  uploadedImagesOrder: string[];
  removedImageIds: string[];
  addExceptionError: any;
  addExceptionInProgress: boolean;
  deleteExceptionId: string | null;
  weeklyExceptionQueries: Record<string, any>;
  monthlyExceptionQueries: Record<string, any>;
  allExceptions: any[];
  deleteExceptionError: any;
  deleteExceptionInProgress: boolean;
  listingDraft: any;
  updatedTab: string | null;
  updateInProgress: boolean;
  payoutDetailsSaveInProgress: boolean;
  payoutDetailsSaved: boolean;
}

const initialState: EditListingState = {
  selectedListingType: null,
  createListingDraftError: null,
  listingId: null,
  publishListingError: null,
  updateListingError: null,
  showListingsError: null,
  uploadImageError: null,
  setStockError: null,
  setStockInProgress: false,
  createListingDraftInProgress: false,
  imageUploadingInProgress: false,
  publishDraftInProgress: false,
  submittedListingId: null,
  redirectToListing: false,
  uploadedImages: {},
  uploadedImagesOrder: [],
  removedImageIds: [],
  addExceptionError: null,
  addExceptionInProgress: false,
  deleteExceptionId: null,
  weeklyExceptionQueries: {},
  monthlyExceptionQueries: {},
  allExceptions: [],
  deleteExceptionError: null,
  deleteExceptionInProgress: false,
  listingDraft: null,
  updatedTab: null,
  updateInProgress: false,
  payoutDetailsSaveInProgress: false,
  payoutDetailsSaved: false,
};

const editListingSlice = createSlice({
  name: 'editListing',
  initialState,
  reducers: {
    resetEditListing: () => {
      return initialState;
    },
    setListingType: (state, {payload}) => {
      state.selectedListingType = payload;
    },
    // fetchAvailabilityExceptionsRequest: (state, {payload}) => {
    //   const {monthId, weekStartId} = payload;
    //   const newData = {
    //     fetchExceptionsError: null,
    //     fetchExceptionsInProgress: true,
    //   };

    //   const exceptionQueriesMaybe = monthId
    //     ? mergeToMonthlyExceptionQueries(
    //         state.monthlyExceptionQueries,
    //         monthId,
    //         newData,
    //       )
    //     : weekStartId
    //     ? mergeToWeeklyExceptionQueries(
    //         state.weeklyExceptionQueries,
    //         weekStartId,
    //         newData,
    //       )
    //     : {};
    //   return {...state, ...exceptionQueriesMaybe};
    // },
    // fetchAvailabilityExceptionsError: (state, {payload}) => {
    //   const {monthId, weekStartId, error} = payload;
    //   const newData = {
    //     fetchExceptionsInProgress: false,
    //     fetchExceptionsError: error,
    //   };

    //   const exceptionQueriesMaybe = monthId
    //     ? mergeToMonthlyExceptionQueries(
    //         state.monthlyExceptionQueries,
    //         monthId,
    //         newData,
    //       )
    //     : weekStartId
    //     ? mergeToWeeklyExceptionQueries(
    //         state.weeklyExceptionQueries,
    //         weekStartId,
    //         newData,
    //       )
    //     : {};

    //   return {...state, ...exceptionQueriesMaybe};
    // },
  },
  extraReducers: builder => {
    builder.addCase(requestShowListing.pending, state => {
      state.showListingsError = null;
    });
    builder.addCase(requestShowListing.fulfilled, (state, {payload}) => {
      const listingIdFromPayload = payload.data.data.id;
      const {
        listingId,
        allExceptions,
        weeklyExceptionQueries,
        monthlyExceptionQueries,
      } = state;
      // If listing stays the same, we trust previously fetched exception data.
      if (listingIdFromPayload?.uuid === state.listingId?.uuid) {
        return {
          ...initialState,
          listingId,
          allExceptions,
          weeklyExceptionQueries,
          monthlyExceptionQueries,
        };
      } else {
        return {
          ...initialState,
          listingId: listingIdFromPayload,
        };
      }
    });
    builder.addCase(requestShowListing.rejected, (state, {payload}) => {
      state.showListingsError = payload;
    });
    builder.addCase(compareAndSetStock.pending, state => {
      state.setStockInProgress = true;
      state.setStockError = null;
    });
    builder.addCase(compareAndSetStock.fulfilled, state => {
      state.setStockInProgress = false;
    });
    builder.addCase(compareAndSetStock.rejected, (state, {payload}) => {
      state.setStockInProgress = false;
      state.setStockError = payload;
    });
    builder.addCase(requestImageUpload.pending, state => {
      state.imageUploadingInProgress = true;
      state.uploadImageError = null;
    });
    builder.addCase(requestImageUpload.fulfilled, state => {
      state.imageUploadingInProgress = false;
    });
    builder.addCase(requestImageUpload.rejected, (state, {payload}) => {
      state.imageUploadingInProgress = false;
      state.uploadImageError = payload;
    });
    builder.addCase(requestCreateListingDraft.pending, state => {
      state.createListingDraftInProgress = true;
      state.createListingDraftError = null;
      state.submittedListingId = null;
      state.listingDraft = null;
    });
    builder.addCase(requestCreateListingDraft.fulfilled, (state, {payload}) => {
      state.createListingDraftInProgress = false;
      state.submittedListingId = payload.data.id;
      state.listingDraft = payload.data;
    });
    builder.addCase(requestCreateListingDraft.rejected, (state, {payload}) => {
      state.createListingDraftInProgress = false;
      state.createListingDraftError = payload;
    });
    builder.addCase(requestUpdateListing.pending, state => {
      state.updateInProgress = true;
      state.updateListingError = null;
    });
    builder.addCase(requestUpdateListing.fulfilled, state => {
      state.updateInProgress = false;
    });
    builder.addCase(requestUpdateListing.rejected, (state, {payload}) => {
      state.updateInProgress = false;
      state.updateListingError = payload;
    });
    builder.addCase(requestPublishListingDraft.pending, state => {
      state.publishDraftInProgress = true;
      state.publishListingError = null;
    });
    builder.addCase(requestPublishListingDraft.fulfilled, state => {
      state.publishDraftInProgress = false;
    });
    builder.addCase(requestPublishListingDraft.rejected, (state, {payload}) => {
      state.publishDraftInProgress = false;
      state.publishListingError = payload;
    });
    //       .addCase(requestAddAvailabilityException.pending, state => {
    //         state.addExceptionError = null;
    //         state.addExceptionInProgress = true;
    //       })
    //       .addCase(
    //         requestAddAvailabilityException.fulfilled,
    //         (state, {payload}) => {
    //           const exception = payload;
    //           const combinedExceptions = state.allExceptions.concat(exception);
    //           const allExceptions = combinedExceptions.sort(
    //             sortExceptionsByStartTime,
    //           );
    //           state.allExceptions = allExceptions;
    //           state.addExceptionInProgress = false;
    //         },
    //       )
    //       .addCase(requestAddAvailabilityException.rejected, (state, {payload}) => {
    //         state.addExceptionInProgress = false;
    //         state.addExceptionError = payload.error;
    //       })
    //       .addCase(
    //         requestFetchAvailabilityExceptions.pending,
    //         (state, action) => {},
    //       )
    //       .addCase(
    //         requestFetchAvailabilityExceptions.fulfilled,
    //         (state, {payload}) => {
    //           const {exceptions, monthId, weekStartId} = payload;
    //           const combinedExceptions = state.allExceptions.concat(exceptions);
    //           const selectId = x => x.id.uuid;
    //           const allExceptions = uniqueBy(combinedExceptions, selectId).sort(
    //             sortExceptionsByStartTime,
    //           );
    //           const newData = {fetchExceptionsInProgress: false};
    //           const exceptionQueriesMaybe = monthId
    //             ? mergeToMonthlyExceptionQueries(
    //                 state.monthlyExceptionQueries,
    //                 monthId,
    //                 newData,
    //               )
    //             : weekStartId
    //             ? mergeToWeeklyExceptionQueries(
    //                 state.weeklyExceptionQueries,
    //                 weekStartId,
    //                 newData,
    //               )
    //             : {};
    //           return {...state, allExceptions, ...exceptionQueriesMaybe};
    //         },
    //       )
    //       .addCase(
    //         requestFetchAvailabilityExceptions.rejected,
    //         (state, {payload}) => {},
    //       )
    //       .addCase(requestDeleteAvailabilityException.pending, (state, {meta}) => {
    //         state.deleteExceptionError = null;
    //         state.deleteExceptionId = meta.arg.id.uuid;
    //         state.deleteExceptionInProgress = true;
    //       })
    //       .addCase(
    //         requestDeleteAvailabilityException.fulfilled,
    //         (state, {payload}) => {
    //           const exception = payload;
    //           const id = exception.id.uuid;
    //           const allExceptions = state.allExceptions.filter(
    //             e => e.id.uuid !== id,
    //           );
    //           return {
    //             ...state,
    //             allExceptions,
    //             deleteExceptionInProgress: false,
    //             deleteExceptionId: null,
    //           };
    //         },
    //       )
    //       .addCase(
    //         requestDeleteAvailabilityException.rejected,
    //         (state, {payload}) => {
    //           state.deleteExceptionError = payload;
    //           state.deleteExceptionId = null;
    //           state.deleteExceptionInProgress = false;
    //         },
    //       );
  },
});

// Thunks
export const requestShowListing = createAsyncThunk<any, any, Thunk>(
  'editListing/requestShowListingStatus',
  async (actionPayload, {dispatch, extra: sdk}) => {
    try {
      const {config, id, ...rest} = actionPayload;
      const imageVariantInfo = getImageVariantInfo(config.layout.listingImage);
      const queryParams = {
        id,
        include: ['author', 'images', 'currentStock'],
        'fields.image': imageVariantInfo.fieldsImage,
        ...imageVariantInfo.imageVariants,
        ...rest,
      };

      const response = await sdk.ownListings.show(queryParams);

      // EditListingPage fetches new listing data, which also needs to be added to global data
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response;
    } catch (error) {
      return storableError(error);
    }
  },
);

// Create listing in draft state
// NOTE: we want to keep it possible to include stock management field to the first wizard form.
// this means that there needs to be a sequence of calls:
// create, set stock, show listing (to get updated currentStock entity)
export const requestCreateListingDraft = createAsyncThunk<any, any, Thunk>(
  'editListing/requestCreateListingDraftStatus',
  async (data, {dispatch, extra: sdk}) => {
    try {
      const {stockUpdate, images, config, ...rest} = data;

      // If images should be saved, create array out of the image UUIDs for the API call
      // Note: in this template, image upload is not happening at the same time as listing creation.
      const imageProperty =
        typeof images !== 'undefined' ? {images: imageIds(images)} : {};
      const ownListingValues = {...imageProperty, ...rest};

      const imageVariantInfo = getImageVariantInfo(config.layout.listingImage);
      const queryParams = {
        expand: true,
        include: ['author', 'images', 'currentStock'],
        'fields.image': imageVariantInfo.fieldsImage,
        ...imageVariantInfo.imageVariants,
      };

      const res = await sdk.ownListings.createDraft(
        ownListingValues,
        queryParams as any,
      );

      await dispatch(requestShowListing({id: res.data.data.id, config}));

      const listingId = res.data.data.id;
      await updateStockOfListingMaybe(listingId, stockUpdate, dispatch);
      return res;
    } catch (error) {
      return storableError(error);
    }
  },
);

// // Update the given tab of the wizard with the given data. This saves
// // the data to the listing, and marks the tab updated so the UI can
// // display the state.
// // NOTE: what comes to stock management, this follows the same pattern used in create listing call

export const requestUpdateListing = createAsyncThunk<any, any, Thunk>(
  'editListing/requestUpdateListingStatus',
  async (data, {dispatch, getState, extra: sdk}) => {
    try {
      const {id, stockUpdate, images, config, ...rest} = data;
      // If images should be saved, create array out of the image UUIDs for the API call
      const imageProperty = Array.isArray(images) ? {images} : {};
      const ownListingUpdateValues = {id, ...imageProperty, ...rest};
      const imageVariantInfo = getImageVariantInfo(config.layout.listingImage);
      const queryParams = {
        expand: true,
        include: ['author', 'images', 'currentStock'],
        'fields.image': imageVariantInfo.fieldsImage,
        ...imageVariantInfo.imageVariants,
      };
      const state = getState();
      const existingTimeZone =
        state.marketplaceData.entities.ownListing[id.uuid]?.attributes
          ?.availabilityPlan?.timezone;
      const includedTimeZone = rest?.availabilityPlan?.timezone;
      updateStockOfListingMaybe(id, stockUpdate, dispatch);
      const response = await sdk.ownListings.update(
        ownListingUpdateValues,
        queryParams as any,
      );
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      // If time zone has changed, we need to fetch exceptions again
      // since week and month boundaries might have changed.
      if (!!includedTimeZone && includedTimeZone !== existingTimeZone) {
        const searchString = '';
        const firstDayOfWeek = config.localization.firstDayOfWeek;
        const listing = response.data.data;
        // fetchLoadDataExceptions(dispatch, listing, searchString, firstDayOfWeek)
      }

      return response;
    } catch (error) {
      return storableError(error);
    }
  },
);

export const requestPublishListingDraft = createAsyncThunk<any, any, Thunk>(
  'editListing/requestPublishListingDraftStatus',
  async (listingId, {dispatch, extra: sdk}) => {
    try {
      const response = await sdk.ownListings.publishDraft(
        {id: listingId},
        {expand: true},
      );

      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response;
    } catch (error) {
      return storableError(error);
    }
  },
);

// Set stock if requested among listing update info
export const compareAndSetStock = createAsyncThunk<any, any, Thunk>(
  'editListing/compareAndSetStockStatus',
  async (data, {dispatch, extra: sdk}) => {
    try {
      const {listingId, oldTotal, newTotal} = data;

      const response = await sdk.stock.compareAndSet(
        {listingId, oldTotal, newTotal},
        {expand: true},
      );

      // NOTE: compareAndSet returns the stock resource of the listing.
      // We update client app's internal state with these updated API entities.
      dispatch(addMarketplaceEntities({sdkResponse: response}));
      return response;
    } catch (error) {
      return storableError(error);
    }
  },
);

export const requestImageUpload = createAsyncThunk<any, any, Thunk>(
  'editListing/requestImageUploadStatus',
  async (actionPayload, {extra: sdk}) => {
    try {
      const {listingImageConfig, file} = actionPayload;

      const imageVariantInfo = getImageVariantInfo(listingImageConfig);
      const queryParams = {
        expand: true,
        'fields.image': imageVariantInfo.fieldsImage,
        ...imageVariantInfo.imageVariants,
      } as any;

      const res = await sdk.images.upload({image: file}, queryParams);
      return res;
    } catch (error) {
      return storableError(error);
    }
  },
);

// export const requestAddAvailabilityException = createAsyncThunk(
//   'editListing/requestAddAvailabilityException',
//   async (params = {}, {dispatch, extra: sdk}) => {
//     try {
//       const response = await sdk.availabilityExceptions.create(params, {
//         expand: true,
//       });

//       const availabilityException = response.data.data;
//       return availabilityException;
//     } catch (e) {
//       return storableError(e);
//     }
//   },
// );

// // export const requestFetchAvailabilityExceptions = createAsyncThunk(
// //   'editListing/requestFetchAvailabilityExceptions',
// //   async (params, { dispatch, extra: sdk }) => {
// //     const { listingId, start, end, timeZone, page, isWeekly } = params
// //     const fetchParams = { listingId, start, end }
// //     const timeUnitIdProp = isWeekly
// //       ? { weekStartId: stringifyDateToISO8601(start) }
// //       : { monthId: monthIdString(start, timeZone) }
// //     try {
// //       dispatch(fetchAvailabilityExceptionsRequest(timeUnitIdProp))
// //       const response = await sdk.availabilityExceptions.query(fetchParams)
// //       const availabilityExceptions = denormalisedResponseEntities(response)

// //       // Fetch potential extra exceptions pagination pages per month.
// //       // In theory, there could be several pagination pages worth of exceptions,
// //       // if range is month and unit is 'hour': 31 days * 24 hour = 744 slots for exceptions.
// //       const totalPages = response.data.meta.totalPages
// //       if (totalPages > 1 && !page) {
// //         const extraPages = getArrayOfNItems(totalPages)
// //         // It's unlikely that this code is reached with default units.
// //         // Note:
// //         //  - Firing multiple API calls might hit API rate limit
// //         //    (This is very unlikely with this query and 'hour' unit.)
// //         //  - TODO: this doesn't take care of failures of those extra calls
// //         Promise.all(
// //           extraPages.map(page => {
// //             return sdk.availabilityExceptions.query({ ...fetchParams, page })
// //           }),
// //         ).then(responses => {
// //           const denormalizedFlatResults = (all, r) =>
// //             all.concat(denormalisedResponseEntities(r))
// //           const exceptions = responses.reduce(denormalizedFlatResults, [])
// //           const data = { ...timeUnitIdProp, exceptions }
// //           return data
// //         })
// //       }
// //       const data = { ...timeUnitIdProp, exceptions: availabilityExceptions }
// //       return data
// //     } catch (e) {
// //       console.log('e', e)
// //       return dispatch(
// //         fetchAvailabilityExceptionsError({
// //           ...timeUnitIdProp,
// //           error: storableError(e),
// //         }),
// //       )
// //     }
// //   },
// // )

// // export const fetchLoadDataExceptions = createAsyncThunk(
// //   'editListing/fetchLoadDataExceptions',
// //   async (params, { dispatch, extra: sdk }) => {
// //     const { listing, search, firstDayOfWeek } = params

// //     const hasWindow = typeof window !== 'undefined'
// //     // Listing could be ownListing entity too, so we just check if attributes key exists
// //     const hasTimeZone = listing?.attributes?.availabilityPlan?.timezone

// //     // Fetch time-zones on client side only.
// //     // Note: listing needs to have time zone set!
// //     if (hasWindow && listing.id && hasTimeZone) {
// //       const listingId = listing.id
// //       // If the listing doesn't have availabilityPlan yet
// //       // use the defaul timezone
// //       const timezone =
// //         listing.attributes.availabilityPlan?.timezone || getDefaultTimeZone()
// //       const todayInListingsTZ = getStartOf(new Date(), 'day', timezone)

// //       const locationSearch = parse(search)
// //       const selectedDate = locationSearch?.d
// //         ? parseDateFromISO8601(locationSearch.d, timezone)
// //         : todayInListingsTZ
// //       const startOfWeek = getStartOfWeek(selectedDate, timezone, firstDayOfWeek)
// //       const prevWeek = getStartOf(startOfWeek, 'day', timezone, -7, 'days')
// //       const nextWeek = getStartOf(startOfWeek, 'day', timezone, 7, 'days')
// //       const nextAfterNextWeek = getStartOf(nextWeek, 'day', timezone, 7, 'days')

// //       const nextMonth = getStartOf(
// //         todayInListingsTZ,
// //         'month',
// //         timezone,
// //         1,
// //         'months',
// //       )
// //       const nextAfterNextMonth = getStartOf(
// //         nextMonth,
// //         'month',
// //         timezone,
// //         1,
// //         'months',
// //       )

// //       const sharedData = { listingId, timeZone: timezone }

// //       // Fetch data for selected week and nearest weeks for WeeklyCalendar
// //       // Plus current month and month after that for EditListingAvailabilityForm
// //       //
// //       // NOTE: This is making 5 different Thunk calls, which update store 2 times each
// //       //       It would make sense to make on thunk function that fires 5 sdk calls/promises,
// //       //       but for the time being, it's clearer to push all the calls through
// //       //       requestFetchAvailabilityExceptions
// //       try {
// //         // Fetch data for selected week and nearest weeks for WeeklyCalendar
// //         // Plus current month and month after that for EditListingAvailabilityForm
// //         await Promise.all([
// //           dispatch(
// //             requestFetchAvailabilityExceptions({
// //               ...sharedData,
// //               isWeekly: true,
// //               start: prevWeek,
// //               end: startOfWeek,
// //             }),
// //           ),
// //           dispatch(
// //             requestFetchAvailabilityExceptions({
// //               ...sharedData,
// //               isWeekly: true,
// //               start: startOfWeek,
// //               end: nextWeek,
// //             }),
// //           ),
// //           dispatch(
// //             requestFetchAvailabilityExceptions({
// //               ...sharedData,
// //               isWeekly: true,
// //               start: nextWeek,
// //               end: nextAfterNextWeek,
// //             }),
// //           ),
// //           dispatch(
// //             requestFetchAvailabilityExceptions({
// //               ...sharedData,
// //               start: todayInListingsTZ,
// //               end: nextMonth,
// //             }),
// //           ),
// //           dispatch(
// //             requestFetchAvailabilityExceptions({
// //               ...sharedData,
// //               start: nextMonth,
// //               end: nextAfterNextMonth,
// //             }),
// //           ),
// //         ])
// //       } catch (error) {
// //         // Handle errors if needed
// //         console.error('Error fetching availability exceptions:', error)
// //       }
// //     }
// //     // By default return an empty array
// //     return Promise.all([])
// //   },
// // )

// export const requestDeleteAvailabilityException = createAsyncThunk(
//   'editListing/requestDeleteAvailabilityException',
//   async (params, {dispatch, extra: sdk}) => {
//     const response = await sdk.availabilityExceptions.delete(params, {
//       expand: true,
//     });
//     const availabilityException = response.data.data;
//     return availabilityException;
//   },
// );

export const listingIdSelector = (state: RootState) =>
  state.editListing.listingId;
export const imageUploadingInProgressSelector = (state: RootState) =>
  state.editListing.imageUploadingInProgress;
export const selectedListingTypeSelector = (state: RootState) =>
  state.editListing.selectedListingType;
export const createListingDraftInProgressSelector = (state: RootState) =>
  state.editListing.createListingDraftInProgress;
export const updateInProgressSelector = (state: RootState) =>
  state.editListing.updateInProgress;
export const publishDraftInProgressSelector = (state: RootState) =>
  state.editListing.publishDraftInProgress;
export const submittedListingIdSelector = (state: RootState) =>
  state.editListing.submittedListingId;
// export const allExceptionsSelector = (state: RootState) =>
//   state.editListing.allExceptions;
// export const addExceptionErrorSelector = (state: RootState) =>
//   state.editListing.addExceptionError;
// export const addExceptionInProgressSelector = (state: RootState) =>
//   state.editListing.addExceptionInProgress;
// export const weeklyExceptionQueriesSelector = (state: RootState) =>
//   state.editListing.weeklyExceptionQueries;
// export const monthlyExceptionQueriesSelector = (state: RootState) =>
//   state.editListing.monthlyExceptionQueries;
// export const deleteExceptionErrorSelector = (state: RootState) =>
//   state.editListing.deleteExceptionError;
// export const deleteExceptionInProgressSelector = (state: RootState) =>
//   state.editListing.deleteExceptionInProgress;
// export const showListingsErrorSelector = (state: RootState) =>
//   state.editListing.showListingsError;
// export const deleteExceptionIdSelector = (state: RootState) =>
//   state.editListing.deleteExceptionId;

export const {
  resetEditListing,
  setListingType,
  // fetchAvailabilityExceptionsError,
  // fetchAvailabilityExceptionsRequest,
} = editListingSlice.actions;

export default editListingSlice.reducer;
