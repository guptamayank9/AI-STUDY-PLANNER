import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setToken, clearToken } from "../services/api";

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    setToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    setToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return { user: data.user };
  } catch {
    clearToken();
    return rejectWithValue("Session expired");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      clearToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; })
      .addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(register.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; })
      .addCase(register.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(loadUser.fulfilled, (s, a) => { s.user = a.payload.user; })
      .addCase(loadUser.rejected,  (s)    => { s.token = null; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
