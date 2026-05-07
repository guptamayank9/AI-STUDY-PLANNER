import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    localStorage.setItem("token", data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token");
    const { data } = await api.get("/auth/me");
    return { user: data.user, token };
  } catch (err) {
    return rejectWithValue("Could not load user");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,
    token:   localStorage.getItem("token") || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    // ── Update user in store without API call ──────────────────────────
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled,  (s, a) => {
        s.loading = false;
        s.token   = a.payload.token;
        s.user    = a.payload.user;
      })
      .addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(register.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.token   = a.payload.token;
        s.user    = a.payload.user;
      })
      .addCase(register.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(loadUser.fulfilled, (s, a) => {
        s.user  = a.payload.user;
        s.token = a.payload.token;
      })
      // ⚠️ loadUser reject pe KUCH MAT KARO — logout mat karo
      .addCase(loadUser.rejected, () => {});
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
