import axios from 'axios';
import sharetribeTokenStore from '../sharetribeTokenStore';
import {BASE_URL, SHARETRIBE_SDK_CLIENT_ID} from '@env';
import Decimal from 'decimal.js';
import appSettings from '../config/settings';
import {types as sdkTypes, transit} from './sdkLoader';

const typeHandlers = [
  {
    type: sdkTypes.BigDecimal,
    customType: Decimal,
    writer: (v: Decimal) => new sdkTypes.BigDecimal(v.toString()),
    reader: (v: {value: string}) => new Decimal(v.value),
  },
];

const serialize = (data: unknown) => {
  return transit.write(data, {
    typeHandlers,
    verbose: appSettings.sdk.transitVerbose,
  });
};

const deserialize = (str: string) => {
  return transit.read(str, {typeHandlers});
};

const apiBaseUrl = () => {
  return BASE_URL;
};

const apiClient = axios.create({
  baseURL: apiBaseUrl(),
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async config => {
    const token = await sharetribeTokenStore({
      clientId: SHARETRIBE_SDK_CLIENT_ID ?? '',
    }).getCookieToken();

    if (token) {
      config.headers.Cookie = token;
    }

    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/transit+json';

    if (
      config.headers['Content-Type'] === 'application/transit+json' &&
      config.data
    ) {
      config.data = serialize(config.data);
    }

    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => {
    const contentType = response.headers['content-type']?.split(';')[0];

    if (contentType === 'application/transit+json') {
      return deserialize(response.data);
    } else if (contentType === 'application/json') {
      return response.data;
    }
    return response.data;
  },
  error => {
    if (error.response) {
      const {data, status, headers} = error.response;

      // Build a richer error object while preserving stack
      const apiError = new Error(data?.message ?? 'API request failed') as any;
      apiError.status = status;
      apiError.code = data?.code;
      apiError.errors = data?.errors;
      apiError.response = {data, status, headers};

      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
