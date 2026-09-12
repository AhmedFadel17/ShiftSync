import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import { mainApi } from './apis';

const rootReducer = combineReducers({
  auth: authReducer,
  [mainApi.reducerPath]: mainApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(mainApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
