/*
  # Create Admin Activity Logs Table

  ## Overview
  Creates a table to track administrative actions in the system for the admin dashboard.
  Includes automatic cleanup to prevent database bloat.

  ## New Tables

  ### 1. admin_activity_logs
  Tracks all administrative actions performed in the system.
  
  **Columns:**
  - `id` (uuid, primary key)
  - `admin_id` (uuid, optional, FK to administradores) - The admin who performed the action
  - `admin_name` (text) - Cached name of admin for display (avoids joins)
  - `action_type` (text) - Type of action: empresa_created, pessoa_added, grupo_created, modelo_published, avaliacao_created, avaliacao_finished, etc.
  - `description` (text) - Human-readable description of the action
  - `entity_type` (text) - Type of entity affected: empresa, pessoa, grupo, modelo, avaliacao
  - `entity_id` (uuid, optional) - ID of the affected entity
  - `entity_name` (text, optional) - Name/identifier of the affected entity for display
  - `created_at` (timestamptz)

  ## Indexes
  - Index on created_at for time-based queries (DESC for recent first)
  - Index on action_type for filtering by type
  - Index on admin_id for filtering by user
  - Composite index for dashboard queries

  ## Cleanup
  - Function to delete logs older than 90 days
  - Keeps maximum of 1000 most recent records

  ## Security
  - Enable RLS with admin-only access
*/

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES administradores(id) ON DELETE SET NULL,
  admin_name text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'empresa_created',
    'empresa_updated',
    'pessoa_created',
    'pessoa_added_to_grupo',
    'grupo_created',
    'modelo_created',
    'modelo_published',
    'avaliacao_created',
    'avaliacao_finished',
    'admin_created',
    'pdi_content_created'
  )),
  description text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN (
    'empresa',
    'pessoa',
    'grupo',
    'modelo',
    'avaliacao',
    'administrador',
    'pdi_content'
  )),
  entity_id uuid,
  entity_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for admin access only
CREATE POLICY "Admins can read activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM administradores
      WHERE administradores.auth_user_id = auth.uid()
      AND administradores.e_administrador = true
    )
  );

CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM administradores
      WHERE administradores.auth_user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at 
  ON admin_activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type 
  ON admin_activity_logs(action_type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id 
  ON admin_activity_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type 
  ON admin_activity_logs(entity_type);

-- Composite index for common dashboard query (recent logs with type filtering)
CREATE INDEX IF NOT EXISTS idx_activity_logs_dashboard 
  ON admin_activity_logs(created_at DESC, action_type, entity_type);

-- Function to cleanup old activity logs
-- Keeps logs from last 90 days AND limits to 1000 most recent records
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_date timestamptz;
  max_records integer := 1000;
BEGIN
  -- Calculate cutoff date (90 days ago)
  cutoff_date := now() - interval '90 days';
  
  -- Delete logs older than 90 days
  DELETE FROM admin_activity_logs
  WHERE created_at < cutoff_date;
  
  -- If still more than max_records, keep only the most recent
  DELETE FROM admin_activity_logs
  WHERE id NOT IN (
    SELECT id FROM admin_activity_logs
    ORDER BY created_at DESC
    LIMIT max_records
  );
END;
$$;

-- Function to log an admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id uuid,
  p_admin_name text,
  p_action_type text,
  p_description text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_entity_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_log_id uuid;
BEGIN
  INSERT INTO admin_activity_logs (
    admin_id,
    admin_name,
    action_type,
    description,
    entity_type,
    entity_id,
    entity_name
  ) VALUES (
    p_admin_id,
    p_admin_name,
    p_action_type,
    p_description,
    p_entity_type,
    p_entity_id,
    p_entity_name
  )
  RETURNING id INTO new_log_id;
  
  -- Run cleanup periodically (every 100th insert roughly)
  IF random() < 0.01 THEN
    PERFORM cleanup_old_activity_logs();
  END IF;
  
  RETURN new_log_id;
END;
$$;
