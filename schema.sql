-- enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1) Ensure user_role enum exists and includes SUPERADMIN
--------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'JOB_MANAGER', 'SUPERADMIN');
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' AND e.enumlabel = 'SUPERADMIN'
    ) THEN
      ALTER TYPE user_role ADD VALUE 'SUPERADMIN';
    END IF;
  END IF;
END$$;

--------------------------------------------------------------------------------
-- 2) Ensure job_type enum exists
--------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
    CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');
  END IF;
END$$;

--------------------------------------------------------------------------------
-- 3) USERS table (UUID PK)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  "role" user_role NOT NULL DEFAULT 'JOB_MANAGER',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

--------------------------------------------------------------------------------
-- 4) JOB POSTINGS table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  location VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  "type" job_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  posted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  posted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings("type");
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);

--------------------------------------------------------------------------------
-- 5) CONTACT FORM SUBMISSIONS table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN NOT NULL DEFAULT false
);

--------------------------------------------------------------------------------
-- 6) CONSULTATION REQUESTS table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  consultation_type VARCHAR(100) NOT NULL,
  other_type_details VARCHAR(255),
  preferred_date DATE,
  meeting_mode VARCHAR(50),
  project_message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_contacted BOOLEAN NOT NULL DEFAULT false
);


CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  current_city VARCHAR(100),

  position_applying_for VARCHAR(255) NOT NULL,
  highest_qualification VARCHAR(100),

  is_fresher BOOLEAN DEFAULT FALSE,
  company_name VARCHAR(255),
  designation VARCHAR(255),
  years_experience NUMERIC(5,2),
  last_ctc NUMERIC(12,2),

  expected_ctc NUMERIC(12,2),

  linkedin_url VARCHAR(1000),
  portfolio_url VARCHAR(1000),

  -- store resume as file path or URL
  resume_path VARCHAR(2000),
  resume_file_name VARCHAR(255),
  resume_content_type VARCHAR(100),
  resume_uploaded_at TIMESTAMPTZ,

  declaration BOOLEAN DEFAULT FALSE,

  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  notes TEXT
);

--------------------------------------------------------------------------------
-- 7) Trigger to prevent deletion of SUPERADMIN (defence-in-depth)
--    (create trigger function first, then attach trigger if not already attached)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_superadmin_delete()
RETURNS trigger AS $$
BEGIN
  IF OLD."role" = 'SUPERADMIN' THEN
    RAISE EXCEPTION 'Cannot delete SUPERADMIN user';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'trg_prevent_superadmin_delete' AND c.relname = 'users'
  ) THEN
    CREATE TRIGGER trg_prevent_superadmin_delete
    BEFORE DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION prevent_superadmin_delete();
  END IF;
END$$;
