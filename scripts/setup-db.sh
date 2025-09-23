#!/bin/bash

# PostgreSQL Database Setup Script for Ahl Allah Application
# This script helps you set up PostgreSQL for the application

echo "🚀 Setting up PostgreSQL for Ahl Allah Application..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
    echo "   macOS: brew install postgresql"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL service is not running. Please start PostgreSQL first."
    echo "   Ubuntu/Debian: sudo systemctl start postgresql"
    echo "   CentOS/RHEL: sudo systemctl start postgresql"
    echo "   macOS: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed and running"

# Get database configuration from environment or use defaults
DB_NAME=${DB_NAME:-"ahl_allah_db"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}

echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Check if database already exists
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping existing database..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        echo "✅ Using existing database"
        exit 0
    fi
fi

# Create database
echo "🏗️  Creating database '$DB_NAME'..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

# Connect to the new database and set up extensions
echo "🔧 Setting up database extensions..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

if [ $? -eq 0 ]; then
    echo "✅ Database extensions set up successfully"
else
    echo "❌ Failed to set up database extensions"
    exit 1
fi

echo ""
echo "🎉 PostgreSQL setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the correct database credentials"
echo "2. Run 'npm install' to install dependencies"
echo "3. Run 'npm run migrate' to create tables"
echo "4. Run 'npm run dev' to start the application"
echo ""
echo "Database connection details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

