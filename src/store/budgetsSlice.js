import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunks would normally fetch from a service
export const fetchUserBudgets = createAsyncThunk(
  "budgets/fetchUserBudgets",
  async (userId, { rejectWithValue }) => {
    try {
      // In a real app, this would call a service function
      // For now, we'll return mock data
      return mockBudgets.filter((budget) => budget.userId === userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewBudget = createAsyncThunk(
  "budgets/addNewBudget",
  async (budgetData, { rejectWithValue }) => {
    try {
      // In a real app, this would call a service function
      const newBudget = {
        id: "budget_" + Date.now(),
        ...budgetData,
      };
      mockBudgets.push(newBudget);
      return newBudget;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const budgetsSlice = createSlice({
  name: "budgets",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addBudget: (state, action) => {
      state.items.push(action.payload);
    },
    updateBudget: (state, action) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeBudget: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBudgets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserBudgets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUserBudgets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addNewBudget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

// Mock data for development
const mockBudgets = [
  {
    id: "budget_1",
    userId: "user_1",
    category: "food",
    limit: 800,
    month: 5,
    year: 2023,
  },
  {
    id: "budget_2",
    userId: "user_1",
    category: "transport",
    limit: 200,
    month: 5,
    year: 2023,
  },
  {
    id: "budget_3",
    userId: "user_1",
    category: "entertainment",
    limit: 300,
    month: 5,
    year: 2023,
  },
];

export const { addBudget, updateBudget, removeBudget } = budgetsSlice.actions;

export default budgetsSlice.reducer;
