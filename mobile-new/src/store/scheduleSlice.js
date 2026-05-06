import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchSchedule   = createAsyncThunk("schedule/fetch",    async () => (await api.get("/schedule")).data.schedule);
export const generateSchedule = createAsyncThunk("schedule/generate", async () => (await api.post("/schedule/generate")).data.schedule);
export const completeSession  = createAsyncThunk("schedule/complete",
  async ({ scheduleId, sessionId }) => (await api.put(`/schedule/${scheduleId}/session/${sessionId}/complete`)).data.schedule
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState: { schedule: null, loading: false, generating: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchSchedule.pending,    (s) => { s.loading = true; })
     .addCase(fetchSchedule.fulfilled,  (s, a) => { s.loading = false; s.schedule = a.payload; })
     .addCase(generateSchedule.pending,   (s) => { s.generating = true; })
     .addCase(generateSchedule.fulfilled, (s, a) => { s.generating = false; s.schedule = a.payload; })
     .addCase(completeSession.fulfilled,  (s, a) => { s.schedule = a.payload; });
  },
});

export default scheduleSlice.reducer;
