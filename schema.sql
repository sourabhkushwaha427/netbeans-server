-- This is required to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---
-- 1. DEFINE CUSTOM TYPES (ENUMs)
---

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
          'ADMIN',
          'JOB_MANAGER'
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        CREATE TYPE job_type AS ENUM (
          'Full-time',
          'Part-time',
          'Contract',
          'Internship'
        );
    END IF;
END$$;


---
-- 2. USER MANAGEMENT (with UUID)
---

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  "role" user_role NOT NULL DEFAULT 'JOB_MANAGER',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Foreign key is also a UUID
  created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

---
-- 3. JOB POSTINGS (with UUID)
---

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
  -- Foreign key is also a UUID
  posted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_type ON job_postings("type");
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);


---
-- 4. CONTACT FORM SUBMISSIONS (with UUID)
---

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN NOT NULL DEFAULT false
);

---
-- 5. CONSULTATION FORM SUBMISSIONS (with UUID)
---

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
