-- Supabase PostgreSQL Database Schema for Viral Crush Prank Link App

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: links
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_code VARCHAR(16) UNIQUE NOT NULL,
  creator_name VARCHAR(60) NOT NULL,
  secret_key VARCHAR(64) NOT NULL,
  open_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  visitor_name VARCHAR(60) NOT NULL,
  crush_name VARCHAR(60) NOT NULL,
  reaction VARCHAR(10) DEFAULT '😂',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_code ON links(unique_code);
CREATE INDEX IF NOT EXISTS idx_submissions_link_id ON submissions(link_id);

-- Enable Row Level Security (RLS)
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write access via API (controlled by backend service role or client)
CREATE POLICY "Allow anon insert for links" ON links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select for links" ON links FOR SELECT USING (true);
CREATE POLICY "Allow anon update for links" ON links FOR UPDATE USING (true);

CREATE POLICY "Allow anon insert for submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select for submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow anon update for submissions" ON submissions FOR UPDATE USING (true);
