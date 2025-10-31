-- PostgreSQL Setup Script for Ahl Allah Application
-- Run this script as a PostgreSQL superuser to set up the database

-- Create database
CREATE DATABASE ahl_allah_db;

-- Create user (optional - you can use the default postgres user)
-- Uncomment and modify the following lines if you want to create a dedicated user
-- CREATE USER ahl_allah_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE ahl_allah_db TO ahl_allah_user;

-- Connect to the new database
\c ahl_allah_db;

-- Enable UUID extension (required for UUID data types)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions (if using dedicated user)
-- GRANT ALL PRIVILEGES ON SCHEMA public TO ahl_allah_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ahl_allah_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ahl_allah_user;

-- Set default privileges for future tables (if using dedicated user)
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ahl_allah_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ahl_allah_user;

-- Display success message
SELECT 'PostgreSQL database setup completed successfully!' as status;

