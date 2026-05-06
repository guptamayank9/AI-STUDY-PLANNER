import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchSchedule = createAsyncThunk("schedule/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/schedule");
    return data.schedule;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const generateSchedule = createAsyncThunk("schedule/generate", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/schedule/generate");
    return data.schedule;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const completeSession = createAsyncThunk(
  "schedule/completeSession",
  async ({ scheduleId, sessionId }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/schedule/${scheduleId}/session/${sessionId}/complete`);
      return data.schedule;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState: { schedule: null, loading: false, generating: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending,    (s) => { s.loading = true; })
      .addCase(fetchSchedule.fulfilled,  (s, a) => { s.loading = false; s.schedule = a.payload; })
      .addCase(fetchSchedule.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(generateSchedule.pending,   (s) => { s.generating = true; })
      .addCase(generateSchedule.fulfilled, (s, a) => { s.generating = false; s.schedule = a.payload; })
      .addCase(generateSchedule.rejected,  (s, a) => { s.generating = false; s.error = a.payload; })
      .addCase(completeSession.fulfilled,  (s, a) => { s.schedule = a.payload; });
  },
});

export default scheduleSlice.reducer;
