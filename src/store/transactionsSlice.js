import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTransactions, saveTransaction, deleteTransaction } from '../services/transactionService';

// Async thunks
export const fetchUserTransactions = createAsyncThunk(
  'transactions/fetchUserTransactions',
  async (userId, { rejectWithValue }) => {
    try {
      const transactions = await fetchTransactions(userId);
      return transactions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewTransaction = createAsyncThunk(
  'transactions/addNewTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const transaction = await saveTransaction(transactionData);
      return transaction;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeTransaction = createAsyncThunk(
  'transactions/removeTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      await deleteTransaction(transactionId);
      return transactionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    addTransaction: (state, action) => {
      state.items.push(action.payload);
    },
    updateTransaction: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeTransactionById: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addNewTransaction.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { addTransaction, updateTransaction, removeTransactionById } = transactionsSlice.actions;

export default transactionsSlice.reducer;