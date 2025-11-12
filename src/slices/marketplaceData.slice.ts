import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../sharetribeSetup';
import {denormalisedEntities, updatedEntities} from '../utils/data';

interface MarketplaceDataState {
  entities: Record<string, any>;
}

const merge = (state: MarketplaceDataState, payload: any) => {
  const {sdkResponse, sanitizeConfig} = payload;
  const apiResponse = sdkResponse.data;
  return {
    ...state,
    entities: updatedEntities({...state.entities}, apiResponse, sanitizeConfig),
  };
};

const initialState: MarketplaceDataState = {
  // Database of all the fetched entities.
  entities: {},
};

const marketplaceDataSlice = createSlice({
  name: 'marketplaceData',
  initialState,
  reducers: {
    addMarketplaceEntities: (state, action) => {
      const newState = merge(state, action?.payload);
      state.entities = newState.entities;
    },
  },
});

/**
 * Get the denormalised listing entities with the given IDs
 *
 * @param {Object} entities the full Redux store
 * @param {Array<UUID>} listingIds listing IDs to select from the store
 */
export const getListingsById = (
  entities: Record<string, any>,
  listingIds: string[],
) => {
  const resources = listingIds.map((id: string) => ({
    id,
    type: 'listing',
  }));
  const throwIfNotFound = false;
  return denormalisedEntities(entities, resources, throwIfNotFound);
};

export const getOwnListingsById = (
  entities: Record<string, any>,
  listingIds: string[],
) => {
  const resources = listingIds.map((id: string) => ({
    id,
    type: 'ownListing',
  }));
  const throwIfNotFound = false;
  return denormalisedEntities(entities, resources, throwIfNotFound);
};
export const getAuthorById = (
  entities: Record<string, any>,
  authorIds: string[],
) => {
  const resources = authorIds?.map((id: string) => ({
    id,
    type: 'user',
  }));
  const throwIfNotFound = false;
  return denormalisedEntities(entities, resources, throwIfNotFound);
};

/**
 * Get the denormalised entities from the given entity references.
 *
 * @param {Object} entities the full Redux store
 *
 * @param {Array<{ id, type }>} entityRefs References to entities that
 * we want to query from the data. Currently we expect that all the
 * entities have the same type.
 *
 * @return {Array<Object>} denormalised entities
 */
export const getMarketplaceEntities = (
  entities: Record<string, any>,
  entityRefs: Array<{id: string; type: string}>,
) => {
  const throwIfNotFound = false;
  return denormalisedEntities(entities, entityRefs, throwIfNotFound);
};

export const entitiesSelector = (state: RootState) =>
  state.marketplaceData.entities;

export const {addMarketplaceEntities} = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;
