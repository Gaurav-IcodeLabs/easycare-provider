import {subUnitDivisors, currencyFormatting} from './settingsCurrency';
import {
  APP_ENV,
  SHARETRIBE_SDK_CLIENT_ID,
  SHARETRIBE_SDK_BASE_URL,
  SHARETRIBE_SDK_ASSET_CDN_BASE_URL,
  SHARETRIBE_SDK_TRANSIT_VERBOSE,
  SENTRY_DSN,
  SHARETRIBE_USING_SSL,
} from '@env';

// NOTE: only expose configuration that should be visible in the
// client side, don't add any server secrets in this file.
//
// To pass environment variables to the client app in the build
// script, react-scripts (and the sharetribe-scripts fork of
// react-scripts) require using the REACT_APP_ prefix to avoid
// exposing server secrets to the client side.

const appSettings = {
  env: APP_ENV,
  dev: APP_ENV === 'development',
  verbose: false,

  sdk: {
    clientId: SHARETRIBE_SDK_CLIENT_ID,
    baseUrl: SHARETRIBE_SDK_BASE_URL,
    assetCdnBaseUrl: SHARETRIBE_SDK_ASSET_CDN_BASE_URL,
    transitVerbose: SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true',
  },

  // Get currency formatting options for given currency.
  // See: https://github.com/yahoo/react-intl/wiki/API#formatnumber
  getCurrencyFormatting: currencyFormatting,
  // It's not guaranteed that currencies can be split to 100 subunits!
  subUnitDivisors,

  // Sentry DSN (Data Source Name), a client key for authenticating calls to Sentry
  sentryDsn: SENTRY_DSN,

  // If webapp is using SSL (i.e. it's behind 'https' protocol)
  usingSSL: SHARETRIBE_USING_SSL === 'true',
};

export default appSettings;
