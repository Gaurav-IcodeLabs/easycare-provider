import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from '../sharetribeSetup';
import {denormalisedEntities, updatedEntities} from '../utils/data';
import axios from 'axios';
import {ADMIN_PANEL_URL} from '@env';
import {
  Category,
  Subcategory,
  ServicesConfigResponse,
  SubSubCategory,
} from '../apptypes/interfaces/serviceConfig';
import {
  ProductCategory,
  ProductsConfigResponse,
  ProductSubcategory,
  ProductSubSubCategory,
} from '../apptypes';
// const ADMIN_PANEL_URL = 'http://192.168.68.110:5378';

interface MarketplaceDataState {
  entities: Record<string, any>;
  categories: Category[];
  categoriesByKeys: Record<string, Category>;
  subcategoriesByKeys: Record<string, Subcategory>;
  subsubcategoriesByKeys: Record<string, SubSubCategory>;
  productCategories: ProductCategory[];
  productCategoriesByKeys: Record<string, ProductCategory>;
  productSubcategoriesByKeys: Record<string, ProductSubcategory>;
  productSubsubcategoriesByKeys: Record<string, ProductSubSubCategory>;
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
  subsubcategoriesByKeys: {},
  productCategories: [],
  productCategoriesByKeys: {},
  productSubcategoriesByKeys: {},
  productSubsubcategoriesByKeys: {},
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
      const subsubcategoriesByKeys: Record<string, SubSubCategory> = {};

      action.payload.forEach(category => {
        categoriesByKeys[category.id] = category;

        // Build subcategoriesByKeys
        category.subcategories.forEach(subcategory => {
          subcategoriesByKeys[subcategory.id] = subcategory;

          subcategory.subSubcategories.forEach(subsubCateggory => {
            subsubcategoriesByKeys[subsubCateggory.id] = subsubCateggory;
          });
        });
      });

      state.categoriesByKeys = categoriesByKeys;
      state.subcategoriesByKeys = subcategoriesByKeys;
      state.subsubcategoriesByKeys = subsubcategoriesByKeys;
    });

    builder.addCase(fetchProductsConfig.fulfilled, (state, action) => {
      state.productCategories = action.payload;

      // Build categoriesByKeys
      const categoriesByKeys: Record<string, ProductCategory> = {};
      const subcategoriesByKeys: Record<string, ProductSubcategory> = {};
      const subsubcategoriesByKeys: Record<string, ProductSubSubCategory> = {};

      action.payload.forEach(category => {
        categoriesByKeys[category.id] = category;

        // Build subcategoriesByKeys
        category.subcategories.forEach(subcategory => {
          subcategoriesByKeys[subcategory.id] = subcategory;

          subcategory.subSubcategories.forEach(subsubCateggory => {
            subsubcategoriesByKeys[subsubCateggory.id] = subsubCateggory;
          });
        });
      });

      state.productCategoriesByKeys = categoriesByKeys;
      state.productSubcategoriesByKeys = subcategoriesByKeys;
      state.productSubsubcategoriesByKeys = subsubcategoriesByKeys;
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
    id: {uuid: id},
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
    id: {uuid: id},
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
    id: {uuid: id},
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

export const fetchProductsConfig = createAsyncThunk<
  ProductCategory[],
  void,
  {rejectValue: string}
>('marketplaceData/fetchProductsConfig', async (_, {rejectWithValue}) => {
  try {
    const response = await axios.get<ProductsConfigResponse>(
      `${ADMIN_PANEL_URL}/api/products/config`,
    );
    // console.log('response.data.data', JSON.stringify(response.data.data));
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

export const productCategoriesSelector = (
  state: RootState,
): ProductCategory[] => state.marketplaceData.productCategories;

export const categoriesByKeysSelector = (
  state: RootState,
): Record<string, Category> => state.marketplaceData.categoriesByKeys;

export const subcategoriesByKeysSelector = (
  state: RootState,
): Record<string, Subcategory> => state.marketplaceData.subcategoriesByKeys;

export const productSubcategoriesByKeysSelector = (
  state: RootState,
): Record<string, ProductSubcategory> =>
  state.marketplaceData.productSubcategoriesByKeys;

export const subsubcategoriesByKeysSelector = (
  state: RootState,
): Record<string, SubSubCategory> =>
  state.marketplaceData.subsubcategoriesByKeys;

export const productSubsubcategoriesByKeysSelector = (
  state: RootState,
): Record<string, ProductSubSubCategory> =>
  state.marketplaceData.productSubsubcategoriesByKeys;

export const selectCategoryById = (
  state: RootState,
  categoryId: string,
): Category | undefined => state.marketplaceData.categoriesByKeys[categoryId];

export const selectSubcategoryById = (
  state: RootState,
  subcategoryId: string,
): Subcategory | undefined =>
  state.marketplaceData.subcategoriesByKeys[subcategoryId];

export const selectSubSubcategoryById = (
  state: RootState,
  subsubcategoryId: string,
): SubSubCategory | undefined =>
  state.marketplaceData.subsubcategoriesByKeys[subsubcategoryId];

export const {addMarketplaceEntities} = marketplaceDataSlice.actions;

export default marketplaceDataSlice.reducer;
