import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: 'male' | 'female'
  height?: number
  weight?: number
  fitness_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  bio?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
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

export interface Workout {
  id: string
  user_id: string
  name: string
  date: string
  duration: number
  category: string
  notes?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  workout_id: string
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  notes?: string
  created_at: string
}

// Muscle groups and their exercises
export const MUSCLE_GROUPS = {
  biceps: {
    name: 'Biceps',
    icon: '💪',
    color: 'bg-blue-500',
    exercises: [
      'Barbell Curls',
      'Dumbbell Curls',
      'Hammer Curls',
      'Preacher Curls',
      'Cable Curls',
      'Concentration Curls',
      'Chin-ups',
      '21s Curls'
    ]
  },
  triceps: {
    name: 'Triceps',
    icon: '🔥',
    color: 'bg-red-500',
    exercises: [
      'Tricep Dips',
      'Close-Grip Bench Press',
      'Overhead Tricep Extension',
      'Tricep Pushdowns',
      'Diamond Push-ups',
      'Skull Crushers',
      'Tricep Kickbacks',
      'Rope Pushdowns'
    ]
  },
  chest: {
    name: 'Chest',
    icon: '🏋️',
    color: 'bg-orange-500',
    exercises: [
      'Bench Press',
      'Incline Bench Press',
      'Decline Bench Press',
      'Dumbbell Flyes',
      'Push-ups',
      'Chest Dips',
      'Cable Crossovers',
      'Incline Dumbbell Press'
    ]
  },
  back: {
    name: 'Back',
    icon: '🎯',
    color: 'bg-green-500',
    exercises: [
      'Pull-ups',
      'Lat Pulldowns',
      'Barbell Rows',
      'Dumbbell Rows',
      'T-Bar Rows',
      'Cable Rows',
      'Deadlifts',
      'Face Pulls'
    ]
  },
  legs: {
    name: 'Legs',
    icon: '🦵',
    color: 'bg-purple-500',
    exercises: [
      'Squats',
      'Leg Press',
      'Lunges',
      'Leg Curls',
      'Leg Extensions',
      'Calf Raises',
      'Romanian Deadlifts',
      'Bulgarian Split Squats'
    ]
  },
  shoulders: {
    name: 'Shoulders',
    icon: '🏆',
    color: 'bg-yellow-500',
    exercises: [
      'Shoulder Press',
      'Lateral Raises',
      'Front Raises',
      'Rear Delt Flyes',
      'Upright Rows',
      'Arnold Press',
      'Shrugs',
      'Pike Push-ups'
    ]
  }
} as const

export type MuscleGroup = keyof typeof MUSCLE_GROUPS