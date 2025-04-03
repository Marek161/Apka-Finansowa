import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      // In a real app, this would call an authentication service
      // For now, we'll simulate a successful login with mock data
      if (
        credentials.email === "user@example.com" &&
        credentials.password === "password"
      ) {
        return {
          id: "user_1",
          email: credentials.email,
          displayName: "Jan Kowalski",
          currency: "PLN",
        };
      } else {
        throw new Error("Nieprawidłowy email lub hasło");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      // In a real app, this would call a registration service
      // For now, we'll simulate a successful registration
      return {
        id: "user_" + Date.now(),
        email: userData.email,
        displayName: userData.displayName,
        currency: userData.currency || "PLN",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;
