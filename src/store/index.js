import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionsSlice';
import budgetsReducer from './budgetsSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    auth: authReducer
  }
});

export default store;