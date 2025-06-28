/*
  # Create Test User Data Migration

  This migration creates sample data for testing purposes.
  It does NOT create auth users - those must be created through:
  1. Supabase Auth signup flow in the app
  2. Supabase dashboard Authentication section
  3. Supabase Auth API

  This migration will only succeed if a user with the specified email
  already exists in the auth.users table.
*/

-- Create a function to safely insert test data only if the user exists
CREATE OR REPLACE FUNCTION create_test_user_data()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Try to find a user with the test email
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@fitness.com' 
  LIMIT 1;

  -- Only proceed if we found a user
  IF test_user_id IS NOT NULL THEN
    -- Insert profile data
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      fitness_level,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'test@fitness.com',
      'Test',
      'User',
      'beginner',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      fitness_level = EXCLUDED.fitness_level,
      updated_at = NOW();

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
      test_user_id,
      'Lose 5kg',
      'Lose weight through diet and exercise',
      5.0,
      1.5,
      'kg',
      'Weight Loss',
      '2024-06-01',
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
      '2024-04-01',
      false
    ),
    (
      test_user_id,
      'Bench Press 80kg',
      'Increase upper body strength',
      80.0,
      65.0,
      'kg',
      'Strength',
      '2024-08-01',
      false
    ) ON CONFLICT DO NOTHING;

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
      test_user_id,
      'Morning Cardio',
      '2024-01-16',
      30,
      'Cardio',
      true
    ),
    (
      test_user_id,
      'Upper Body Strength',
      '2024-01-15',
      60,
      'Strength',
      false
    ),
    (
      test_user_id,
      'Yoga Session',
      '2024-01-17',
      45,
      'Flexibility',
      false
    ) ON CONFLICT DO NOTHING;

    -- Add sample exercises for the workouts
    INSERT INTO exercises (
      workout_id,
      name,
      sets,
      reps,
      weight,
      duration
    )
    SELECT 
      w.id,
      'Push-ups',
      3,
      15,
      NULL,
      NULL
    FROM workouts w 
    WHERE w.user_id = test_user_id 
    AND w.name = 'Upper Body Strength'
    ON CONFLICT DO NOTHING;

    INSERT INTO exercises (
      workout_id,
      name,
      sets,
      reps,
      weight,
      duration
    )
    SELECT 
      w.id,
      'Running',
      1,
      1,
      NULL,
      30
    FROM workouts w 
    WHERE w.user_id = test_user_id 
    AND w.name = 'Morning Cardio'
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Test data created successfully for user: %', test_user_id;
  ELSE
    RAISE NOTICE 'No user found with email test@fitness.com. Please create the user first through Supabase Auth.';
  END IF;
END;
$$;

-- Execute the function
SELECT create_test_user_data();

-- Clean up the function
DROP FUNCTION create_test_user_data();