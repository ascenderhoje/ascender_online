/*
  # Create Helper Function for Auth User Creation

  ## Overview
  Creates a helper function to properly create auth users with correct password hashing
  using Supabase's expected format.

  ## Changes
  1. Create function to insert auth users with proper password format
  2. Recreate the ascenderh@gmail.com user with correct credentials
*/

-- Function to create auth user with proper password hashing
CREATE OR REPLACE FUNCTION create_auth_user(
  p_email text,
  p_password text,
  p_nome text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
BEGIN
  -- Generate new user ID
  v_user_id := gen_random_uuid();
  
  -- Hash password using crypt with bcrypt
  v_encrypted_password := crypt(p_password, gen_salt('bf'));
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_password,
    NOW(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    CASE WHEN p_nome IS NOT NULL 
      THEN jsonb_build_object('nome', p_nome)
      ELSE '{}'::jsonb
    END,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', p_email
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the admin user with correct password
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Create auth user
  v_user_id := create_auth_user('ascenderh@gmail.com', 'ascender2025@#', 'Administrador Ascender');
  
  -- Update administradores table with auth_user_id
  UPDATE administradores
  SET auth_user_id = v_user_id
  WHERE email = 'ascenderh@gmail.com';
  
  RAISE NOTICE 'User created with ID: %', v_user_id;
END $$;
