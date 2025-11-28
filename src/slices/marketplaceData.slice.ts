import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from '../sharetribeSetup';
import {denormalisedEntities, updatedEntities} from '../utils/data';
import axios from 'axios';
import {ADMIN_PANEL_URL} from '@env';
import {
  Category,
  Subcategory,
  ServicesConfigResponse,
} from '../apptypes/interfaces/serviceConfig';

interface MarketplaceDataState {
  entities: Record<string, any>;
  categories: Category[];
  categoriesByKeys: Record<string, Category>;
  subcategoriesByKeys: Record<string, Subcategory>;
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
  entities: {},
  categories: [],
  categoriesByKeys: {},
  subcategoriesByKeys: {},
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
  extraReducers: builder => {
    builder.addCase(fetchServicesConfig.fulfilled, (state, action) => {
      state.categories = action.payload;

      // Build categoriesByKeys
      const categoriesByKeys: Record<string, Category> = {};
      const subcategoriesByKeys: Record<string, Subcategory> = {};

      action.payload.forEach(category => {
        categoriesByKeys[category.id] = category;

        // Build subcategoriesByKeys
        category.subcategories.forEach(subcategory => {
          subcategoriesByKeys[subcategory.id] = subcategory;
        });
      });

      state.categoriesByKeys = categoriesByKeys;
      state.subcategoriesByKeys = subcategoriesByKeys;
    });
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

export const fetchServicesConfig = createAsyncThunk<
  Category[],
  void,
  {rejectValue: string}
>('marketplaceData/fetchServicesConfig', async (_, {rejectWithValue}) => {
  try {
    const response = await axios.get<ServicesConfigResponse>(
      `${ADMIN_PANEL_URL}/api/services/config`,
    );
    return response.data.data.categories;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        'Failed to fetch services config',
    );
  }
});

// Selectors
export const entitiesSelector = (state: RootState) =>
  state.marketplaceData.entities;

export const categoriesSelector = (state: RootState): Category[] =>
  state.marketplaceData.categories;

export const categoriesByKeysSelector = (
  state: RootState,
): Record<string, Category> => state.marketplaceData.categoriesByKeys;

export const subcategoriesByKeysSelector = (
  state: RootState,
): Record<string, Subcategory> => state.marketplaceData.subcategoriesByKeys;

export const selectCategoryById = (
  state: RootState,
  categoryId: string,
): Category | undefined => state.marketplaceData.categoriesByKeys[categoryId];

export const selectSubcategoryById = (
  state: RootState,
  subcategoryId: string,
): Subcategory | undefined =>
  state.marketplaceData.subcategoriesByKeys[subcategoryId];

export const {addMarketplaceEntities} = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;
