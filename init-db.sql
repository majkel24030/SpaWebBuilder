-- Initialize Windoor Config Database
-- This script runs automatically when PostgreSQL container starts

-- Ensure database is created (usually already done by Docker)
SELECT 'CREATE DATABASE windoor_config' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'windoor_config')\gexec

-- Connect to the database
\c windoor_config;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (tables will be created by SQLAlchemy)
-- These will be created after the application starts and creates tables

-- Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE windoor_config TO windoor_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO windoor_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO windoor_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO windoor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO windoor_user;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log initialization
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Print success message
SELECT 'Database initialized successfully' as message;