import Decimal from 'decimal.js';
import {types as sdkTypes} from '../utils/sdkLoader';
import has from 'lodash/has';
import appSettings from '../config/settings';
const {subUnitDivisors} = appSettings;
const {Money} = sdkTypes;

export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER || -1 * (2 ** 53 - 1);
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 2 ** 53 - 1;

export const isSafeNumber = decimalValue => {
  if (!(decimalValue instanceof Decimal)) {
    throw new Error('Value must be a Decimal');
  }
  return (
    decimalValue.gte(MIN_SAFE_INTEGER) && decimalValue.lte(MAX_SAFE_INTEGER)
  );
};

const isNumber = value => {
  return typeof value === 'number' && !isNaN(value);
};

// Get the minor unit divisor for the given currency
export const unitDivisor = currency => {
  if (!has(subUnitDivisors, currency)) {
    throw new Error(
      `No minor unit divisor defined for currency: ${currency} in currencySettings.js`,
    );
  }
  return subUnitDivisors[currency];
};
// Divisor can be positive value given as Decimal, Number, or String
const convertDivisorToDecimal = divisor => {
  try {
    const divisorAsDecimal = new Decimal(divisor);
    if (divisorAsDecimal.isNegative()) {
      throw new Error(`Parameter (${divisor}) must be a positive number.`);
    }
    return divisorAsDecimal;
  } catch (e) {
    throw new Error(`Parameter (${divisor}) must present a number.`, e);
  }
};

/* eslint-disable no-underscore-dangle */
// Detect if the given value is a goog.math.Long object
// See: https://google.github.io/closure-library/api/goog.math.Long.html
const isGoogleMathLong = value => {
  return (
    typeof value === 'object' && isNumber(value.low_) && isNumber(value.high_)
  );
};

/**
 * Convert Money to a number
 *
 * @param {Money} value
 *
 * @return {Number} converted value
 */
export const convertMoneyToNumber = value => {
  if (!(value instanceof Money)) {
    throw new Error('Value must be a Money type');
  }
  const subUnitDivisorAsDecimal = convertDivisorToDecimal(
    unitDivisor(value.currency),
  );
  let amount;

  if (isGoogleMathLong(value.amount)) {
    // TODO: temporarily also handle goog.math.Long values created by
    // the Transit tooling in the Sharetribe JS SDK. This should be
    // removed when the value.amount will be a proper Decimal type.

    // eslint-disable-next-line no-console
    console.warn(
      'goog.math.Long value in money amount:',
      value.amount,
      value.amount.toString(),
    );

    amount = new Decimal(value.amount.toString());
  } else {
    amount = new Decimal(value.amount);
  }

  if (!isSafeNumber(amount)) {
    throw new Error(
      `Cannot represent money minor unit value ${amount.toString()} safely as a number`,
    );
  }

  return amount.dividedBy(subUnitDivisorAsDecimal).toNumber();
};

/**
 * Ensures that the given string uses only dots or commas
 * e.g. ensureSeparator('9999999,99', false) // => '9999999.99'
 *
 * @param {String} str - string to be formatted
 *
 * @return {String} converted string
 */
export const ensureSeparator = (str, useComma = false) => {
  if (typeof str !== 'string') {
    throw new TypeError('Parameter must be a string');
  }
  return useComma ? str.replace(/\./g, ',') : str.replace(/,/g, '.');
};

/**
 * Ensures that the given string uses only dots
 * (e.g. JavaScript floats use dots)
 *
 * @param {String} str - string to be formatted
 *
 * @return {String} converted string
 */
export const ensureDotSeparator = str => {
  return ensureSeparator(str, false);
};

/**
 * Convert string to Decimal object (from Decimal.js math library)
 * Handles both dots and commas as decimal separators
 *
 * @param {String} str - string to be converted
 *
 * @return {Decimal} numeral value
 */
export const convertToDecimal = str => {
  const dotFormattedStr = ensureDotSeparator(str);
  return new Decimal(dotFormattedStr);
};

/**
 * Converts given value to sub unit value and returns it as a number
 *
 * @param {Number|String} value
 *
 * @param {Decimal|Number|String} subUnitDivisor - should be something that can be converted to
 * Decimal. (This is a ratio between currency's main unit and sub units.)
 *
 * @param {boolean} useComma - optional.
 * Specify if return value should use comma as separator
 *
 * @return {number} converted value
 */
export const convertUnitToSubUnit = (
  value,
  subUnitDivisor,
  useComma = false,
) => {
  const subUnitDivisorAsDecimal = convertDivisorToDecimal(subUnitDivisor);

  if (!(typeof value === 'string' || typeof value === 'number')) {
    throw new TypeError('Value must be either number or string');
  }

  const val =
    typeof value === 'string'
      ? convertToDecimal(value, useComma)
      : new Decimal(value);
  const amount = val.times(subUnitDivisorAsDecimal);

  if (!isSafeNumber(amount)) {
    throw new Error(
      `Cannot represent money minor unit value ${amount.toString()} safely as a number`,
    );
  } else if (amount.isInteger()) {
    return amount.toNumber();
  } else {
    throw new Error(`value must divisible by ${subUnitDivisor}`);
  }
};

// 'en-US' is local for formatting
export function formatCurrencyAndNumber(amount, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}
/**
 * Format the given money to a string
 *
 * @param {Object} intl
 * @param {Money} value
 *
 * @return {String} formatted money value
 */

export const formatMoney = value => {
  if (!(value instanceof Money)) {
    throw new Error('Value must be a Money type');
  }
  const numberFormat = formatCurrencyAndNumber(
    value.amount / 100,
    value.currency,
  );
  return numberFormat;
};
