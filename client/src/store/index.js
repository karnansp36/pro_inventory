// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import usersSlice from './slices/usersSlice'
import salesSlice from './slices/salesSlice'
import expensesSlice from './slices/expensesSlice'
import stockRequestsSlice from './slices/stockRequestsSlice'
import transportSlice from './slices/transportSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    sales: salesSlice,
    expenses: expensesSlice,
    stockRequests: stockRequestsSlice,
    transport: transportSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store