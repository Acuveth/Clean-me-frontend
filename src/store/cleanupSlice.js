import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/constants";

export const fetchNearbyTrash = createAsyncThunk(
  "cleanup/fetchNearbyTrash",
  async (location) => {
    const token = await SecureStore.getItemAsync("authToken");
    const response = await fetch(
      `${API_BASE_URL}/cleanup/nearby?lat=${location.latitude}&lng=${location.longitude}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await response.json();
  }
);

export const startCleanupSession = createAsyncThunk(
  "cleanup/startSession",
  async (sessionData) => {
    const token = await SecureStore.getItemAsync("authToken");
    const response = await fetch(`${API_BASE_URL}/cleanup/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });
    return await response.json();
  }
);

const cleanupSlice = createSlice({
  name: "cleanup",
  initialState: {
    nearbyTrash: [],
    activeSession: null,
    verificationResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearActiveSession: (state) => {
      state.activeSession = null;
      state.verificationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNearbyTrash.fulfilled, (state, action) => {
        state.nearbyTrash = action.payload;
      })
      .addCase(startCleanupSession.fulfilled, (state, action) => {
        state.activeSession = action.payload;
      });
  },
});

export const { clearActiveSession } = cleanupSlice.actions;
export default cleanupSlice.reducer;
