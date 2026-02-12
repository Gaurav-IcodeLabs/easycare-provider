import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {RootState} from '../sharetribeSetup';
import {adminApiClient} from '../utils/api.helper';

interface Request {
  _id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  requestedBy: string;
  [key: string]: any;
}

interface PaginationMeta {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

interface RequestsState {
  serviceRequests: Request[];
  productRequests: Request[];
  servicePagination: PaginationMeta;
  productPagination: PaginationMeta;
  fetchServiceRequestsInProgress: boolean;
  fetchProductRequestsInProgress: boolean;
  fetchServiceRequestsError: any;
  fetchProductRequestsError: any;
  serviceHasMore: boolean;
  productHasMore: boolean;
}

const initialPagination: PaginationMeta = {
  page: 1,
  perPage: 10,
  totalPages: 0,
  totalItems: 0,
};

const initialState: RequestsState = {
  serviceRequests: [],
  productRequests: [],
  servicePagination: initialPagination,
  productPagination: initialPagination,
  fetchServiceRequestsInProgress: false,
  fetchProductRequestsInProgress: false,
  fetchServiceRequestsError: null,
  fetchProductRequestsError: null,
  serviceHasMore: true,
  productHasMore: true,
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    resetServiceRequests: state => {
      state.serviceRequests = [];
      state.servicePagination = initialPagination;
      state.serviceHasMore = true;
      state.fetchServiceRequestsError = null;
    },
    resetProductRequests: state => {
      state.productRequests = [];
      state.productPagination = initialPagination;
      state.productHasMore = true;
      state.fetchProductRequestsError = null;
    },
  },
  extraReducers: builder => {
    // Service Requests
    builder.addCase(fetchServiceRequests.pending, state => {
      state.fetchServiceRequestsInProgress = true;
      state.fetchServiceRequestsError = null;
    });
    builder.addCase(fetchServiceRequests.fulfilled, (state, {payload}) => {
      const {data, page, totalPages, totalCount, isLoadMore, limit} = payload;

      if (isLoadMore) {
        state.serviceRequests = [...state.serviceRequests, ...data];
      } else {
        state.serviceRequests = data;
      }

      state.servicePagination = {
        page,
        perPage: limit || state.servicePagination.perPage,
        totalPages,
        totalItems: totalCount,
      };
      state.serviceHasMore = page < totalPages;
      state.fetchServiceRequestsInProgress = false;
    });
    builder.addCase(fetchServiceRequests.rejected, (state, {payload}) => {
      state.fetchServiceRequestsInProgress = false;
      state.fetchServiceRequestsError = payload;
    });

    // Product Requests
    builder.addCase(fetchProductRequests.pending, state => {
      state.fetchProductRequestsInProgress = true;
      state.fetchProductRequestsError = null;
    });
    builder.addCase(fetchProductRequests.fulfilled, (state, {payload}) => {
      const {data, page, totalPages, totalCount, isLoadMore, limit} = payload;

      if (isLoadMore) {
        state.productRequests = [...state.productRequests, ...data];
      } else {
        state.productRequests = data;
      }

      state.productPagination = {
        page,
        perPage: limit || state.productPagination.perPage,
        totalPages,
        totalItems: totalCount,
      };
      state.productHasMore = page < totalPages;
      state.fetchProductRequestsInProgress = false;
    });
    builder.addCase(fetchProductRequests.rejected, (state, {payload}) => {
      state.fetchProductRequestsInProgress = false;
      state.fetchProductRequestsError = payload;
    });
  },
});

interface FetchRequestsParams {
  userId: string;
  page?: number;
  limit?: number;
  isLoadMore?: boolean;
}

export const fetchServiceRequests = createAsyncThunk<any, FetchRequestsParams>(
  'requests/fetchServiceRequests',
  async (params, {rejectWithValue}) => {
    const {userId, page = 1, limit = 10, isLoadMore = false} = params;

    try {
      const response = await adminApiClient.post(
        '/api/service-requests/my-requests',
        {userId},
        {params: {page, limit}},
      );

      if (response?.success) {
        return {...response, isLoadMore, limit};
      } else {
        return rejectWithValue(
          response?.message || 'Failed to fetch service requests',
        );
      }
    } catch (error: any) {
      console.error('fetchServiceRequests error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch service requests',
      );
    }
  },
);

export const fetchProductRequests = createAsyncThunk<any, FetchRequestsParams>(
  'requests/fetchProductRequests',
  async (params, {rejectWithValue}) => {
    const {userId, page = 1, limit = 10, isLoadMore = false} = params;

    try {
      const response = await adminApiClient.post(
        '/api/product-requests/my-requests',
        {userId},
        {params: {page, limit}},
      );

      if (response?.success) {
        return {...response, isLoadMore, limit};
      } else {
        return rejectWithValue(
          response?.message || 'Failed to fetch product requests',
        );
      }
    } catch (error: any) {
      console.error('fetchProductRequests error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch product requests',
      );
    }
  },
);

// Selectors
export const serviceRequestsSelector = (state: RootState) =>
  state.requests.serviceRequests;

export const productRequestsSelector = (state: RootState) =>
  state.requests.productRequests;

export const servicePaginationSelector = (state: RootState) =>
  state.requests.servicePagination;

export const productPaginationSelector = (state: RootState) =>
  state.requests.productPagination;

export const serviceHasMoreSelector = (state: RootState) =>
  state.requests.serviceHasMore;

export const productHasMoreSelector = (state: RootState) =>
  state.requests.productHasMore;

export const fetchServiceRequestsInProgressSelector = (state: RootState) =>
  state.requests.fetchServiceRequestsInProgress;

export const fetchProductRequestsInProgressSelector = (state: RootState) =>
  state.requests.fetchProductRequestsInProgress;

export const fetchServiceRequestsErrorSelector = (state: RootState) =>
  state.requests.fetchServiceRequestsError;

export const fetchProductRequestsErrorSelector = (state: RootState) =>
  state.requests.fetchProductRequestsError;

export const {resetServiceRequests, resetProductRequests} =
  requestsSlice.actions;

export default requestsSlice.reducer;
