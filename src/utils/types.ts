// Supported schema types for custom fields added to extended data through configuration.
export const SCHEMA_TYPE_ENUM = 'enum';
export const SCHEMA_TYPE_MULTI_ENUM = 'multi-enum';
export const SCHEMA_TYPE_TEXT = 'text';
export const SCHEMA_TYPE_LONG = 'long';
export const SCHEMA_TYPE_BOOLEAN = 'boolean';
export const SCHEMA_TYPE_DATE = 'date';
export const SCHEMA_TYPE_PHONENUMBER = 'phone_number';
export const EXTENDED_DATA_SCHEMA_TYPES = [
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_DATE,
  SCHEMA_TYPE_PHONENUMBER,
];

export const LINE_ITEM_NIGHT = 'line-item/night';
export const LINE_ITEM_DAY = 'line-item/day';
export const LINE_ITEM_HOUR = 'line-item/hour';
export const LINE_ITEM_ITEM = 'line-item/item';
export const LINE_ITEM_CUSTOMER_COMMISSION = 'line-item/customer-commission';
export const LINE_ITEM_PROVIDER_COMMISSION = 'line-item/provider-commission';
export const LINE_ITEM_SHIPPING_FEE = 'line-item/shipping-fee';
export const LINE_ITEM_PICKUP_FEE = 'line-item/pickup-fee';
export const LINE_ITEM_HOME_SERVICE_FEE = 'line-item/home-service-fee';
export const LINE_ITEM_VAT_TAX = 'line-item/vat-tax';

export const LINE_ITEMS = [
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_ITEM,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  LINE_ITEM_SHIPPING_FEE,
  LINE_ITEM_PICKUP_FEE,
];
export const LISTING_UNIT_TYPES = [
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_ITEM,
];

export const STOCK_ONE_ITEM = 'oneItem';
export const STOCK_MULTIPLE_ITEMS = 'multipleItems';
export const STOCK_INFINITE_ONE_ITEM = 'infiniteOneItem';
export const STOCK_INFINITE_MULTIPLE_ITEMS = 'infiniteMultipleItems';
export const STOCK_INFINITE_ITEMS = [
  STOCK_INFINITE_ONE_ITEM,
  STOCK_INFINITE_MULTIPLE_ITEMS,
];
export const STOCK_TYPES = [
  STOCK_ONE_ITEM,
  STOCK_MULTIPLE_ITEMS,
  STOCK_INFINITE_ONE_ITEM,
  STOCK_INFINITE_MULTIPLE_ITEMS,
];
export const PRIMARY_FILTER = 'primary';

// Options for showing just date or date and time on TimeRange and OrderBreakdown
export const DATE_TYPE_DATE = 'date';
export const DATE_TYPE_TIME = 'time';
export const DATE_TYPE_DATETIME = 'datetime';

export const ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_CUSTOMER =
  'transaction-already-reviewed-by-customer';
export const ERROR_CODE_TRANSACTION_ALREADY_REVIEWED_BY_PROVIDER =
  'transaction-already-reviewed-by-provider';
export const ERROR_CODE_TRANSACTION_INVALID_TRANSITION =
  'transaction-invalid-transition';
export const ERROR_CODE_TOO_MANY_VERIFICATION_REQUESTS =
  'email-too-many-verification-requests';

// Possible amount of stars in a review
export const REVIEW_RATINGS = [1, 2, 3, 4, 5];

export const TIME_SLOT_TIME = 'time-slot/time';
