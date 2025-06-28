import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export interface ProgressMetric {
  id: string
  user_id: string
  metric_type: 'weight' | 'body_fat' | 'muscle_mass' | 'bench_press' | 'run_time' | 'weekly_workouts'
  current_value: number
  previous_value: number
  target_value: number
  unit: string
  recorded_date: string
  created_at: string
}

export interface WeeklyProgressData {
  week: string
  workouts: number
  calories: number
  weight: number
  date_range: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  type: 'weight_loss' | 'strength_gain' | 'cardio_improvement' | 'consistency'
  achieved_date: string
  icon: string
}

interface ProgressState {
  metrics: ProgressMetric[]
  weeklyData: WeeklyProgressData[]
  achievements: Achievement[]
  loading: boolean
  error: string | null
}

const initialState: ProgressState = {
  metrics: [],
  weeklyData: [],
  achievements: [],
  loading: false,
  error: null,
}

export const fetchProgressMetrics = createAsyncThunk(
  'progress/fetchMetrics',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchWeeklyProgress = createAsyncThunk(
  'progress/fetchWeeklyProgress',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Get workouts from the last 6 weeks
      const sixWeeksAgo = new Date()
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42)
      
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('date, duration, completed')
        .eq('user_id', userId)
        .gte('date', sixWeeksAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error

      // Process data into weekly chunks
      const weeklyData: WeeklyProgressData[] = []
      const workoutData = workouts || []
      
      for (let i = 0; i < 6; i++) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (6 - i) * 7)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        const weekWorkouts = workoutData.filter(w => {
          const workoutDate = new Date(w.date)
          return workoutDate >= weekStart && workoutDate <= weekEnd
        })
        
        const completedWorkouts = weekWorkouts.filter(w => w.completed)
        const totalDuration = completedWorkouts.reduce((sum, w) => sum + w.duration, 0)
        const estimatedCalories = totalDuration * 8 // Rough estimate: 8 calories per minute
        
        weeklyData.push({
          week: `Week ${i + 1}`,
          workouts: completedWorkouts.length,
          calories: estimatedCalories,
          weight: 75 - (i * 0.5), // Mock weight data - would come from progress_metrics in real app
          date_range: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
        })
      }
      
      return weeklyData
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProgressMetric = createAsyncThunk(
  'progress/createMetric',
  async (
    { 
      userId, 
      metricData 
    }: { 
      userId: string
      metricData: Omit<ProgressMetric, 'id' | 'user_id' | 'created_at'> 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('progress_metrics')
        .insert({
          user_id: userId,
          ...metricData
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

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addAchievement: (state, action: PayloadAction<Achievement>) => {
      state.achievements.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchProgressMetrics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProgressMetrics.fulfilled, (state, action) => {
        state.loading = false
        state.metrics = action.payload
      })
      .addCase(fetchProgressMetrics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch weekly progress
      .addCase(fetchWeeklyProgress.fulfilled, (state, action) => {
        state.weeklyData = action.payload
      })
      .addCase(fetchWeeklyProgress.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Create metric
      .addCase(createProgressMetric.fulfilled, (state, action) => {
        state.metrics.unshift(action.payload)
      })
      .addCase(createProgressMetric.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError, addAchievement } = progressSlice.actions
export default progressSlice.reducer