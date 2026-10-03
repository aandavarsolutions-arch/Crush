-- Supabase PostgreSQL Database Schema for Viral Crush Prank Link App
-- Clean Fresh Re-creation Script

-- 1. Drop old tables cleanly
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS links CASCADE;

-- 2. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create fresh links table
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code VARCHAR(16) UNIQUE NOT NULL,
  creator_name VARCHAR(60) NOT NULL,
  secret_key VARCHAR(64) NOT NULL,
  open_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create fresh submissions table with creator_name included
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  creator_name VARCHAR(60) NOT NULL,
  visitor_name VARCHAR(60) NOT NULL,
  crush_name VARCHAR(60) NOT NULL,
  reaction VARCHAR(10) DEFAULT '😂',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create performance indexes
CREATE INDEX idx_links_code ON links(unique_code);
CREATE INDEX idx_submissions_link_id ON submissions(link_id);

-- 6. Disable RLS for unrestricted clean backend access
ALTER TABLE links DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- 7. Reload schema cache immediately
NOTIFY pgrst, 'reload schema';
