// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import usersSlice from './slices/usersSlice'
import salesSlice from './slices/salesSlice'
import expensesSlice from './slices/expensesSlice'
import stockRequestsSlice from './slices/stockRequestsSlice'
import transportSlice from './slices/transportSlice'
import activityLogsSlice from './slices/activityLogsSlice'
import exportsSlice from './slices/exportSlice'
import reportsSlice from './slices/reportsSlice'

export const store = configureStore({
  reducer: {
  auth: authSlice,
  users: usersSlice,
  sales: salesSlice,
  expenses: expensesSlice,
  stockRequests: stockRequestsSlice,
  transport: transportSlice,
  activityLogs: activityLogsSlice,
  exports: exportsSlice,
  reports: reportsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store