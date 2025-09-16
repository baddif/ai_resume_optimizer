import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage'; // 使用 localStorage
import { persistReducer, persistStore } from 'redux-persist';
import jobRoleReducer from './jobRoleSlice';
import authRegisterReducer from './authRegisterSlice';

const persistConfig = {
  key: 'root',
  storage,
  // debug: true, // 启用调试模式
};

const rootReducer = combineReducers({
  jobRole: jobRoleReducer,
  authRegister: authRegisterReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 添加中间件来记录状态变化
const logger = (store) => (next) => (action) => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('Next State:', store.getState());
  return result;
};

export const store = configureStore({
  reducer: persistedReducer,
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       // 忽略 redux-persist 的 action
  //       ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
  //     },
  //   }).concat(logger),
  // devTools: true,
});

export const persistor = persistStore(store);

// 初始化时打印初始状态
// console.log('Initial State:', store.getState());
