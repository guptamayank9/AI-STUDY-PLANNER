import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchPerformance = createAsyncThunk("analytics/performance", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/analytics/performance");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchWeekly = createAsyncThunk("analytics/weekly", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/analytics/weekly");
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: { performance: [], prediction: null, weeklyData: [], streak: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPerformance.pending,   (s) => { s.loading = true; })
      .addCase(fetchPerformance.fulfilled, (s, a) => {
        s.loading = false;
        s.performance = a.payload.performance;
        s.prediction  = a.payload.prediction;
      })
      .addCase(fetchWeekly.fulfilled, (s, a) => {
        s.weeklyData = a.payload.weeklyData;
        s.streak     = a.payload.streak;
      });
  },
});

export default analyticsSlice.reducer;
