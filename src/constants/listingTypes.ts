export enum ListingType {
  PRODUCT = 'product',
  SERVICE = 'service',
}

export enum TransactionProcessAlias {
  PRODUCT_PURCHASE = 'default-purchase/release-1',
  SERVICE_BOOKING = 'default-booking/release-1',
}

export enum UnitType {
  ITEM = 'item',
  HOUR = 'hour',
}

export interface ListingTypeConfig {
  listingType: ListingType;
  transactionProcessAlias: TransactionProcessAlias;
  unitType: UnitType;
}

export const LISTING_TYPE_CONFIGS: Record<ListingType, ListingTypeConfig> = {
  [ListingType.PRODUCT]: {
    listingType: ListingType.PRODUCT,
    transactionProcessAlias: TransactionProcessAlias.PRODUCT_PURCHASE,
    unitType: UnitType.ITEM,
  },
  [ListingType.SERVICE]: {
    listingType: ListingType.SERVICE,
    transactionProcessAlias: TransactionProcessAlias.SERVICE_BOOKING,
    unitType: UnitType.HOUR,
  },
};

export const getListingTypeConfig = (
  listingType?: string,
): ListingTypeConfig => {
  if (listingType === ListingType.SERVICE) {
    return LISTING_TYPE_CONFIGS[ListingType.SERVICE];
  }
  // Default to product
  return LISTING_TYPE_CONFIGS[ListingType.PRODUCT];
};
