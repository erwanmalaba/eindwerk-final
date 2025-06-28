import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export interface Goal {
  id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  category: string
  deadline: string
  completed: boolean
  created_at: string
  updated_at: string
}

interface GoalState {
  goals: Goal[]
  loading: boolean
  error: string | null
  selectedGoal: Goal | null
}

const initialState: GoalState = {
  goals: [],
  loading: false,
  error: null,
  selectedGoal: null,
}

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (
    { 
      userId, 
      goalData 
    }: { 
      userId: string
      goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'> 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          ...goalData
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async (
    { goalId, updates }: { goalId: string; updates: Partial<Goal> },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      return goalId
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setSelectedGoal: (state, action: PayloadAction<Goal | null>) => {
      state.selectedGoal = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    updateGoalProgress: (state, action: PayloadAction<{ goalId: string; progress: number }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId)
      if (goal) {
        goal.current_value = action.payload.progress
        goal.completed = goal.current_value >= goal.target_value
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false
        state.goals = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create goal
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload)
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Update goal
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(g => g.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Delete goal
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(g => g.id !== action.payload)
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { 
  setSelectedGoal, 
  clearError, 
  updateGoalProgress 
} = goalSlice.actions

export default goalSlice.reducer