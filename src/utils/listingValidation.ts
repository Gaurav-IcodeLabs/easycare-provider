import {RootState} from '../sharetribeSetup';
import {
  categoriesByKeysSelector,
  subcategoriesByKeysSelector,
  subsubcategoriesByKeysSelector,
  productCategoriesByKeysSelector,
  productSubcategoriesByKeysSelector,
  productSubsubcategoriesByKeysSelector,
} from '../slices/marketplaceData.slice';

/**
 * Checks if a listing qualifies as not deleted by verifying the deleted status
 * at each category level (category, subcategory, subsubcategory)
 *
 * @param state - Redux state
 * @param categoryKey - Category ID (level 1)
 * @param subcategoryKey - Subcategory ID (level 2)
 * @param subsubcategoryKey - Subsubcategory ID (level 3)
 * @param listingType - Type of listing ('service' or 'product')
 * @returns true if listing is not deleted at any level, false otherwise
 *
 * @example
 * ```typescript
 * const isNotDeleted = useSelector((state: RootState) =>
 *   isListingNotDeleted(state, category, subCategory, subSubCategory, listingType)
 * );
 *
 * if (!isNotDeleted) {
 *   // Handle deleted listing - hide it or show a message
 *   return null;
 * }
 * ```
 */
export const isListingNotDeleted = (
  state: RootState,
  categoryKey: string,
  subcategoryKey: string,
  subsubcategoryKey: string,
  listingType: string,
): boolean => {
  console.log('🔍 Checking listing deletion status:', {
    categoryKey,
    subcategoryKey,
    subsubcategoryKey,
    listingType,
  });

  if (listingType === 'service') {
    // Check service category level (level 1)
    const categoriesByKeys = categoriesByKeysSelector(state);
    const categoryData = categoriesByKeys[categoryKey];
    console.log('📁 Service Category:', categoryData?.deleted);
    if (categoryData?.deleted) {
      return false;
    }

    // Check service subcategory level (level 2)
    const subcategoriesByKeys = subcategoriesByKeysSelector(state);
    const subcategoryData = subcategoriesByKeys[subcategoryKey];
    console.log('📂 Service Subcategory:', subcategoryData?.deleted);
    if (subcategoryData?.deleted) {
      return false;
    }

    // Check service subsubcategory level (level 3)
    const subsubcategoriesByKeys = subsubcategoriesByKeysSelector(state);
    const subsubcategoryData = subsubcategoriesByKeys[subsubcategoryKey];
    console.log('📄 Service SubSubcategory:', subsubcategoryData?.deleted);
    if (subsubcategoryData?.deleted) {
      return false;
    }
  } else if (listingType === 'product') {
    // Check product category level (level 1)
    const productCategoriesByKeys = productCategoriesByKeysSelector(state);
    const categoryData = productCategoriesByKeys[categoryKey];
    console.log('📁 Product Category:', categoryData?.deleted);
    if (categoryData?.deleted) {
      return false;
    }

    // Check product subcategory level (level 2)
    const productSubcategoriesByKeys =
      productSubcategoriesByKeysSelector(state);
    const subcategoryData = productSubcategoriesByKeys[subcategoryKey];
    console.log('📂 Product Subcategory:', subcategoryData?.deleted);
    if (subcategoryData?.deleted) {
      return false;
    }

    // Check product subsubcategory level (level 3)
    const productSubsubcategoriesByKeys =
      productSubsubcategoriesByKeysSelector(state);
    const subsubcategoryData = productSubsubcategoriesByKeys[subsubcategoryKey];
    console.log('📄 Product SubSubcategory:', subsubcategoryData?.deleted);
    if (subsubcategoryData?.deleted) {
      return false;
    }
  }

  console.log('✅ Listing is NOT deleted');
  return true;
};
