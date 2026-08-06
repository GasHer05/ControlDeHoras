import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getConfig, updateConfig } from "../services/configService";

const initialState = {
  ivaRate: 22,
  loading: false,
  error: null,
};

export const fetchConfig = createAsyncThunk(
  "config/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      return await getConfig();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateIvaRate = createAsyncThunk(
  "config/updateIvaRate",
  async (ivaRate, { rejectWithValue }) => {
    try {
      return await updateConfig({ ivaRate: Number(ivaRate) });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.ivaRate = action.payload.ivaRate;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateIvaRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIvaRate.fulfilled, (state, action) => {
        state.loading = false;
        state.ivaRate = action.payload.ivaRate;
      })
      .addCase(updateIvaRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default configSlice.reducer;
