/*
  # Debug Database State

  This migration will help us understand what's in the database
  and create test data if needed.
*/

-- Function to debug and fix database state
CREATE OR REPLACE FUNCTION debug_and_fix_database()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_count INTEGER;
  profile_count INTEGER;
  goal_count INTEGER;
  workout_count INTEGER;
  test_user_id uuid;
  result_text text := '';
BEGIN
  -- Count existing data
  SELECT COUNT(*) INTO auth_user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO goal_count FROM goals;
  SELECT COUNT(*) INTO workout_count FROM workouts;
  
  result_text := result_text || 'Database State:' || chr(10);
  result_text := result_text || '- Auth users: ' || auth_user_count || chr(10);
  result_text := result_text || '- Profiles: ' || profile_count || chr(10);
  result_text := result_text || '- Goals: ' || goal_count || chr(10);
  result_text := result_text || '- Workouts: ' || workout_count || chr(10);
  
  -- If no auth users exist, we can't create them via SQL
  IF auth_user_count = 0 THEN
    result_text := result_text || chr(10) || 'No auth users found!' || chr(10);
    result_text := result_text || 'Please create a user by:' || chr(10);
    result_text := result_text || '1. Going to /auth in the app and signing up' || chr(10);
    result_text := result_text || '2. Or using the Supabase dashboard' || chr(10);
    RETURN result_text;
  END IF;
  
  -- Create missing profiles for existing auth users
  INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    fitness_level,
    created_at,
    updated_at
  )
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'Test'),
    'beginner',
    NOW(),
    NOW()
  FROM auth.users au
  LEFT JOIN profiles p ON au.id = p.id
  WHERE p.id IS NULL;
  
  GET DIAGNOSTICS profile_count = ROW_COUNT;
  IF profile_count > 0 THEN
    result_text := result_text || chr(10) || 'Created ' || profile_count || ' missing profiles' || chr(10);
  END IF;
  
  -- Get a test user ID (first available user)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Add sample goals if none exist for this user
    IF NOT EXISTS (SELECT 1 FROM goals WHERE user_id = test_user_id) THEN
      INSERT INTO goals (
        user_id,
        title,
        description,
        target_value,
        current_value,
        unit,
        category,
        deadline,
        completed
      ) VALUES 
      (
        test_user_id,
        'Lose 5kg',
        'Lose weight through diet and exercise',
        5.0,
        1.5,
        'kg',
        'Weight Loss',
        (CURRENT_DATE + INTERVAL '6 months')::date,
        false
      ),
      (
        test_user_id,
        'Run 5K in 25 minutes',
        'Improve cardiovascular endurance',
        25.0,
        28.0,
        'minutes',
        'Cardio',
        (CURRENT_DATE + INTERVAL '3 months')::date,
        false
      );
      
      result_text := result_text || 'Added sample goals for user: ' || test_user_id || chr(10);
    END IF;
    
    -- Add sample workouts if none exist for this user
    IF NOT EXISTS (SELECT 1 FROM workouts WHERE user_id = test_user_id) THEN
      INSERT INTO workouts (
        user_id,
        name,
        date,
        duration,
        category,
        completed
      ) VALUES 
      (
        test_user_id,
        'Morning Cardio',
        CURRENT_DATE,
        30,
        'Cardio',
        true
      ),
      (
        test_user_id,
        'Upper Body Strength',
        CURRENT_DATE - 1,
        60,
        'Strength',
        false
      );
      
      result_text := result_text || 'Added sample workouts for user: ' || test_user_id || chr(10);
    END IF;
  END IF;
  
  -- Final count
  SELECT COUNT(*) INTO auth_user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO goal_count FROM goals;
  SELECT COUNT(*) INTO workout_count FROM workouts;
  
  result_text := result_text || chr(10) || 'Final Database State:' || chr(10);
  result_text := result_text || '- Auth users: ' || auth_user_count || chr(10);
  result_text := result_text || '- Profiles: ' || profile_count || chr(10);
  result_text := result_text || '- Goals: ' || goal_count || chr(10);
  result_text := result_text || '- Workouts: ' || workout_count || chr(10);
  
  RETURN result_text;
END;
$$;

-- Execute the function and show results
SELECT debug_and_fix_database();

-- Clean up
DROP FUNCTION debug_and_fix_database();