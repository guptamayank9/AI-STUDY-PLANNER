import { configureStore } from "@reduxjs/toolkit";
import authReducer     from "./authSlice";
import scheduleReducer from "./scheduleSlice";
import analyticsReducer from "./analyticsSlice";

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    schedule:  scheduleReducer,
    analytics: analyticsReducer,
  },
});
