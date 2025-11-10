// store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import activitiesReducer from './slices/activitiesSlice'
import filtersReducer from './slices/filtersSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch