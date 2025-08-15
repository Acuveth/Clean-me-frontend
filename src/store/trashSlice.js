import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/constants";

export const fetchTrashReports = createAsyncThunk(
  "trash/fetchReports",
  async () => {
    const token = await SecureStore.getItemAsync("authToken");
    const response = await fetch(`${API_BASE_URL}/trash/reports`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  }
);

export const submitTrashReport = createAsyncThunk(
  "trash/submitReport",
  async (reportData) => {
    const token = await SecureStore.getItemAsync("authToken");
    const formData = new FormData();

    formData.append("photo", {
      uri: reportData.photo.uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    formData.append("latitude", reportData.location.latitude.toString());
    formData.append("longitude", reportData.location.longitude.toString());
    formData.append("description", reportData.description);
    formData.append("trashType", reportData.trashType);
    formData.append("size", reportData.size);
    formData.append("timestamp", reportData.timestamp);

    const response = await fetch(`${API_BASE_URL}/trash/report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit report");
    }

    return await response.json();
  }
);

const trashSlice = createSlice({
  name: "trash",
  initialState: {
    reports: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrashReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrashReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchTrashReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitTrashReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      });
  },
});

export const { clearError } = trashSlice.actions;
export default trashSlice.reducer;
