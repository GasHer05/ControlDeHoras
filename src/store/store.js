import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage para web
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import clientesReducer from "./clientesSlice";
import registrosHorasReducer from "./registrosHorasSlice";
import authReducer from "./authSlice";
import configReducer from "./configSlice";

// Root reducer (se completará cuando estén los slices)
const rootReducer = combineReducers({
  clientes: clientesReducer,
  registrosHoras: registrosHorasReducer,
  auth: authReducer,
  config: configReducer,
});

const persistConfig = {
  key: "root",
  storage,
  // config vive en Firestore y se refresca al iniciar sesión; persistirlo dejaría
  // una tasa de IVA vieja pisando la que trae fetchConfig al rehidratar.
  blacklist: ["config"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
