/*
  # Fix Loading Issue - Ensure User Data Exists

  This migration will:
  1. Check if there are any auth users without profiles
  2. Create missing profiles for existing auth users
  3. Create a dummy user if no users exist
  4. Add sample data for testing

  Note: This migration is safe to run multiple times.
*/

-- Function to create missing profiles for existing auth users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  profile_count INTEGER;
BEGIN
  -- Check how many profiles exist
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  RAISE NOTICE 'Found % existing profiles', profile_count;
  
  -- Create profiles for any auth users that don't have them
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      fitness_level,
      created_at,
      updated_at
    ) VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(user_record.raw_user_meta_data->>'last_name', 'Test'),
      'beginner',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created profile for user: %', user_record.email;
  END LOOP;
  
  -- If no users exist at all, we'll note that but can't create auth users via SQL
  IF NOT EXISTS (SELECT 1 FROM auth.users) THEN
    RAISE NOTICE 'No auth users found. Please create a user through the app signup or Supabase dashboard.';
  END IF;
END;
$$;

-- Function to add sample data for existing users
CREATE OR REPLACE FUNCTION add_sample_data_for_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Add sample data for each user that doesn't have any goals
  FOR user_record IN 
    SELECT p.id, p.email
    FROM profiles p
    LEFT JOIN goals g ON p.id = g.user_id
    WHERE g.user_id IS NULL
  LOOP
    -- Add sample goals
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
      user_record.id,
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
      user_record.id,
      'Run 5K in 25 minutes',
      'Improve cardiovascular endurance',
      25.0,
      28.0,
      'minutes',
      'Cardio',
      (CURRENT_DATE + INTERVAL '3 months')::date,
      false
    ),
    (
      user_record.id,
      'Bench Press 80kg',
      'Increase upper body strength',
      80.0,
      65.0,
      'kg',
      'Strength',
      (CURRENT_DATE + INTERVAL '8 months')::date,
      false
    );

    -- Add sample workouts
    INSERT INTO workouts (
      user_id,
      name,
      date,
      duration,
      category,
      completed
    ) VALUES 
    (
      user_record.id,
      'Morning Cardio',
      CURRENT_DATE,
      30,
      'Cardio',
      true
    ),
    (
      user_record.id,
      'Upper Body Strength',
      CURRENT_DATE - 1,
      60,
      'Strength',
      false
    ),
    (
      user_record.id,
      'Yoga Session',
      CURRENT_DATE + 1,
      45,
      'Flexibility',
      false
    );

    RAISE NOTICE 'Added sample data for user: %', user_record.email;
  END LOOP;
END;
$$;

-- Execute the functions
SELECT create_missing_profiles();
SELECT add_sample_data_for_users();

-- Clean up the functions
DROP FUNCTION create_missing_profiles();
DROP FUNCTION add_sample_data_for_users();

-- Show current state
DO $$
DECLARE
  auth_user_count INTEGER;
  profile_count INTEGER;
  goal_count INTEGER;
  workout_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO goal_count FROM goals;
  SELECT COUNT(*) INTO workout_count FROM workouts;
  
  RAISE NOTICE 'Database state after migration:';
  RAISE NOTICE '- Auth users: %', auth_user_count;
  RAISE NOTICE '- Profiles: %', profile_count;
  RAISE NOTICE '- Goals: %', goal_count;
  RAISE NOTICE '- Workouts: %', workout_count;
  
  IF auth_user_count = 0 THEN
    RAISE NOTICE 'No auth users found. Please create a user by:';
    RAISE NOTICE '1. Going to /auth in the app and signing up';
    RAISE NOTICE '2. Or creating a user in the Supabase dashboard';
  END IF;
END;
$$;