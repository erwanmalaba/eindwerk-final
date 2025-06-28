import { configureStore } from '@reduxjs/toolkit'
import workoutReducer from './slices/workoutSlice'
import goalReducer from './slices/goalSlice'
import uiReducer from './slices/uiSlice'
import progressReducer from './slices/progressSlice'

export const store = configureStore({
  reducer: {
    workouts: workoutReducer,
    goals: goalReducer,
    ui: uiReducer,
    progress: progressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch