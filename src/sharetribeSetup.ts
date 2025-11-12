import {createInstance} from 'sharetribe-flex-sdk';
import sharetribeTokenStore from './sharetribeTokenStore';
import {combineReducers, configureStore, createAction} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import * as reducers from '../src/slices';
import storage from '@react-native-async-storage/async-storage';
import {persistReducer, persistStore} from 'redux-persist';
import {SDK} from './apptypes';
import reactotron from '../reactotron.config';
import {SHARETRIBE_SDK_CLIENT_ID, SHARETRIBE_SDK_CLIENT_SECRET} from '@env';

export const sdk: SDK = createInstance({
  clientId: SHARETRIBE_SDK_CLIENT_ID ?? '',
  tokenStore: sharetribeTokenStore({
    clientId: SHARETRIBE_SDK_CLIENT_ID ?? '',
  }),
  clientSecret: SHARETRIBE_SDK_CLIENT_SECRET ?? '',
});

export const resetAllSlices = createAction('resetAllSlices');

// Persist config for auth slice - only isAuthenticated
const authPersistConfig = {
  key: 'auth',
  storage: storage,
  whitelist: ['isAuthenticated'],
};

const rootReducer = combineReducers({
  ...reducers,
  auth: persistReducer(authPersistConfig, reducers.auth),
});

// Define RootState from the root reducer before persistence
export type RootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['user', 'app'],
  version: 0,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: sdk,
      },
      immutableCheck: true,
      serializableCheck: false,
    }),
  enhancers: getDefaultEnhancers =>
    __DEV__
      ? getDefaultEnhancers().concat(reactotron.createEnhancer()) // Only in dev
      : getDefaultEnhancers(),
});

const persistor = persistStore(store);

export {store, persistor};

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
