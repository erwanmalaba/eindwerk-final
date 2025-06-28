import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export interface Exercise {
  id?: string
  name: string
  sets: number
  reps: number
  weight?: number
  notes?: string
}

export interface Workout {
  id: string
  name: string
  date: string
  duration: number
  exercises: Exercise[]
  muscle_group: string
  completed: boolean
  notes?: string
}

interface WorkoutState {
  workouts: Workout[]
  loading: boolean
  error: string | null
  selectedWorkout: Workout | null
}

const initialState: WorkoutState = {
  workouts: [],
  loading: false,
  error: null,
  selectedWorkout: null,
}

// Async thunks for API calls
export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (workoutsError) throw workoutsError

      // Fetch exercises for each workout
      const workoutsWithExercises = await Promise.all(
        (workoutsData || []).map(async (workout) => {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id)

          if (exercisesError) {
            console.error('Error fetching exercises:', exercisesError)
            return {
              ...workout,
              exercises: [],
              muscle_group: workout.category
            }
          }

          return {
            ...workout,
            exercises: exercisesData || [],
            muscle_group: workout.category
          }
        })
      )

      return workoutsWithExercises
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createWorkout = createAsyncThunk(
  'workouts/createWorkout',
  async (
    { 
      userId, 
      workoutData 
    }: { 
      userId: string
      workoutData: Omit<Workout, 'id'> 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const estimatedDuration = (workoutData.exercises?.length || 0) * 10

      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: workoutData.name,
          date: workoutData.date,
          duration: estimatedDuration,
          category: workoutData.muscle_group,
          notes: workoutData.notes || "",
          completed: false
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Insert exercises
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        const exercisesToInsert = workoutData.exercises.map(exercise => ({
          workout_id: newWorkout.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          notes: exercise.notes
        }))

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert)

        if (exercisesError) throw exercisesError
      }

      return {
        ...newWorkout,
        exercises: workoutData.exercises || [],
        muscle_group: workoutData.muscle_group
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateWorkoutCompletion = createAsyncThunk(
  'workouts/updateCompletion',
  async (
    { workoutId, completed }: { workoutId: string; completed: boolean },
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ completed })
        .eq('id', workoutId)

      if (error) throw error

      return { workoutId, completed }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) throw error

      return workoutId
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setSelectedWorkout: (state, action: PayloadAction<Workout | null>) => {
      state.selectedWorkout = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    // Optimistic updates for better UX
    optimisticToggleCompletion: (state, action: PayloadAction<string>) => {
      const workout = state.workouts.find(w => w.id === action.payload)
      if (workout) {
        workout.completed = !workout.completed
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workouts
      .addCase(fetchWorkouts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.loading = false
        state.workouts = action.payload
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create workout
      .addCase(createWorkout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createWorkout.fulfilled, (state, action) => {
        state.loading = false
        state.workouts.unshift(action.payload)
      })
      .addCase(createWorkout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update completion
      .addCase(updateWorkoutCompletion.fulfilled, (state, action) => {
        const { workoutId, completed } = action.payload
        const workout = state.workouts.find(w => w.id === workoutId)
        if (workout) {
          workout.completed = completed
        }
      })
      .addCase(updateWorkoutCompletion.rejected, (state, action) => {
        state.error = action.payload as string
        // Revert optimistic update if needed
      })
      // Delete workout
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.workouts = state.workouts.filter(w => w.id !== action.payload)
      })
      .addCase(deleteWorkout.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { 
  setSelectedWorkout, 
  clearError, 
  optimisticToggleCompletion 
} = workoutSlice.actions

export default workoutSlice.reducer