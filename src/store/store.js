import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage para web

import clientesReducer from "./clientesSlice";
import registrosHorasReducer from "./registrosHorasSlice";
import authReducer from "./authSlice";

// Root reducer (se completará cuando estén los slices)
const rootReducer = combineReducers({
  clientes: clientesReducer,
  registrosHoras: registrosHorasReducer,
  auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
