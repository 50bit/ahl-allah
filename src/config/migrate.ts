import sequelize from './database';
import { initializeDatabase } from '../models';

/**
 * Migration script to set up PostgreSQL database
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Sync all models (create tables)
 * 3. Set up proper indexes and constraints
 */
export const migrateToPostgreSQL = async () => {
  try {
    console.log('Starting PostgreSQL migration...');
    
    // Initialize database connection and sync models
    await initializeDatabase();
    
    console.log('PostgreSQL migration completed successfully!');
    console.log('All tables have been created with proper indexes and constraints.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToPostgreSQL()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

