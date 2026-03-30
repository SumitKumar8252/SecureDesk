import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";
import { clearSession, getStoredSession, saveSession } from "../../utils/session";

const storedSession = getStoredSession();

export const registerUser = createAsyncThunk("auth/registerUser", async (accountDetails, thunkApi) => {
  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: accountDetails,
    });

    saveSession({
      token: data.token,
      user: data.user,
    });

    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(error.message);
  }
});

export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, thunkApi) => {
  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    });

    saveSession({
      token: data.token,
      user: data.user,
    });

    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(error.message);
  }
});

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, thunkApi) => {
  const state = thunkApi.getState();
  const token = state.auth.token || getStoredSession().token;

  if (!token) {
    return thunkApi.rejectWithValue("Authentication token is missing.");
  }

  try {
    const data = await apiRequest("/auth/me", {
      token,
    });

    saveSession({
      token,
      user: data.user,
    });

    return {
      token,
      user: data.user,
    };
  } catch (error) {
    clearSession();
    return thunkApi.rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: storedSession.token,
    user: storedSession.user,
    status: "idle",
    error: "",
  },
  reducers: {
    resetAuthFeedback(state) {
      state.error = "";

      if (state.status === "failed") {
        state.status = "idle";
      }
    },
    logout(state) {
      clearSession();
      state.token = "";
      state.user = null;
      state.status = "idle";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to create account.";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to login.";
      })
      .addCase(fetchProfile.pending, (state) => {
        if (!state.user) {
          state.status = "loading";
        }

        state.error = "";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.token = "";
        state.user = null;
        state.error = action.payload || "Unable to load profile.";
      });
  },
});

export const { resetAuthFeedback, logout } = authSlice.actions;
export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
