-- ==============================================================================
-- FIX: Robust User Creation Trigger
-- ==============================================================================
-- Run this script in your Supabase Dashboard > SQL Editor to fix the "Database error"
-- This update makes the handle_new_user function resistant to missing names
-- and prevents errors if a profile already exists for the user.

CREATE OR REPLACE FUNCTION api.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- 1. Determine the name safely
  -- Try to get name from metadata, fallback to email username, then to 'Nouveau Membre'
  user_name := new.raw_user_meta_data->>'name';
  
  IF user_name IS NULL OR user_name = '' THEN
    user_name := COALESCE(split_part(new.email, '@', 1), 'Nouveau Membre');
  END IF;

  -- 2. Insert or Update Profile
  -- Uses ON CONFLICT to avoid "duplicate key" errors if the trigger fires multiple times
  -- IMPORTANT: Using 'api' schema as requested
  INSERT INTO api.profiles (id, name, email, role)
  VALUES (new.id, user_name, new.email, 'client')
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the trigger is active
-- Triggers on auth.users are global, but the function it calls is now in 'api' schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE api.handle_new_user();
