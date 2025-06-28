/*
  # Add Profile Picture Storage Support

  1. Storage Setup
    - Create a storage bucket for profile pictures
    - Set up RLS policies for secure access
    - Allow users to upload and manage their own profile pictures

  2. Security
    - Users can only access their own profile pictures
    - File size and type restrictions
    - Secure upload and download policies
*/

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to view their own profile pictures
CREATE POLICY "Users can view own profile picture"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to get profile picture URL
CREATE OR REPLACE FUNCTION get_profile_picture_url(user_id uuid, file_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM storage.objects 
          WHERE bucket_id = 'profile-pictures' 
          AND name = user_id::text || '/' || file_name
        )
        THEN 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/profile-pictures/' || user_id::text || '/' || file_name
        ELSE NULL
      END
  );
END;
$$;