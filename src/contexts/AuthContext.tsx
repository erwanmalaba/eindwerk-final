import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session with faster timeout
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          // Handle invalid refresh token immediately
          if (sessionError.message && (
            sessionError.message.includes('Refresh Token Not Found') ||
            sessionError.message.includes('Invalid Refresh Token') ||
            sessionError.message.includes('refresh_token_not_found')
          )) {
            console.warn('⚠️ Auth: Invalid refresh token, clearing session');
            try {
              await supabase.auth.signOut()
            } catch (signOutError) {
              // Expected error, ignore
            }
            
            if (mounted) {
              setSession(null)
              setUser(null)
              setProfile(null)
              setLoading(false)
            }
            return
          }
          
          console.error('❌ Auth: Session error:', sessionError.message);
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
        }

        if (session?.user && mounted) {
          // Fetch profile in parallel, don't wait for it to complete loading
          fetchProfile(session.user.id).finally(() => {
            if (mounted) {
              setLoading(false)
            }
          })
        } else if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth: Initialization error:', error);
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Start initialization immediately
    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (import.meta.env.DEV) {
        console.log('🔄 Auth: State changed:', event, session?.user?.email || 'No user');
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Don't wait for profile fetch to complete
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        if (event === 'SIGNED_OUT') {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          const { data: userData } = await supabase.auth.getUser()
          
          if (userData.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email || '',
                first_name: userData.user.user_metadata?.first_name || 'User',
                last_name: userData.user.user_metadata?.last_name || 'Test',
                fitness_level: 'beginner'
              })
              .select()
              .single()

            if (createError) {
              console.error('❌ Auth: Profile creation error:', createError.message);
            } else {
              console.log('✅ Auth: Profile created');
              setProfile(newProfile)
            }
          }
        } else {
          console.error('❌ Auth: Profile fetch error:', error.message);
        }
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ Auth: Profile error:', error);
    }
  }

  const signUp = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      })

      if (error) {
        console.error('❌ Auth: Sign up error:', error.message);
      } else {
        console.log('✅ Auth: Sign up successful');
      }

      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Auth: Sign in error:', error.message);
      } else {
        console.log('✅ Auth: Sign in successful');
      }

      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      console.log('✅ Auth: Sign out successful');
    } catch (error) {
      console.error('❌ Auth: Sign out error:', error);
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    } else if (error) {
      console.error('❌ Auth: Profile update error:', error.message);
    }

    return { error }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}