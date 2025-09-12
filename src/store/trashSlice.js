import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/constants";

export const fetchTrashReports = createAsyncThunk(
  "trash/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      
      if (!token) {
        // If no token, return empty array instead of failing
        console.log("No auth token found, returning empty reports array");
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/trash/reports`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication failed, clear token and return empty array
          console.log("Auth token expired/invalid, clearing token");
          await SecureStore.deleteItemAsync("authToken");
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching trash reports:", error);
      return rejectWithValue(error.message || "Failed to fetch trash reports");
    }
  }
);

export const fetchTrashReportById = createAsyncThunk(
  "trash/fetchReportById",
  async (reportId, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      
      if (!token) {
        console.log("No auth token found for fetching report");
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/trash/report/${reportId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Report not found");
        }
        if (response.status === 401) {
          await SecureStore.deleteItemAsync("authToken");
          throw new Error("Authentication failed");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching trash report:", error);
      return rejectWithValue(error.message || "Failed to fetch report");
    }
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
    currentReport: null,
    loading: false,
    reportLoading: false,
    error: null,
    reportError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReportError: (state) => {
      state.reportError = null;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
      state.reportError = null;
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
      .addCase(fetchTrashReportById.pending, (state) => {
        state.reportLoading = true;
        state.reportError = null;
      })
      .addCase(fetchTrashReportById.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.currentReport = action.payload;
        state.reportError = null;
      })
      .addCase(fetchTrashReportById.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError = action.payload || action.error.message;
      })
      .addCase(submitTrashReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      });
  },
});

export const { clearError, clearReportError, clearCurrentReport } = trashSlice.actions;
export default trashSlice.reducer;
