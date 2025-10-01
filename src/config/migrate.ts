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
    
    // Ensure MohafezUsers.organizationId is nullable and FK uses ON DELETE SET NULL / ON UPDATE CASCADE
    await sequelize.transaction(async (t) => {
      // Make column nullable (if it was NOT NULL previously)
      await sequelize.query(
        'ALTER TABLE "MohafezUsers" ALTER COLUMN "organizationId" DROP NOT NULL;',
        { transaction: t }
      ).catch(() => {/* ignore if already nullable */});

      // Find existing FK constraints on MohafezUsers.organizationId referencing Organizations
      const [constraints]: any = await sequelize.query(
        `SELECT con.conname AS constraint_name
         FROM pg_constraint con
         JOIN pg_class rel ON rel.oid = con.conrelid
         JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
         JOIN pg_class relf ON relf.oid = con.confrelid
         WHERE rel.relname = 'MohafezUsers'
           AND relf.relname = 'Organizations'
           AND att.attname = 'organizationId'
           AND con.contype = 'f';`,
        { transaction: t }
      );

      // Drop any existing FK so we can recreate with proper actions
      for (const row of constraints as Array<{ constraint_name: string }>) {
        await sequelize.query(
          `ALTER TABLE "MohafezUsers" DROP CONSTRAINT "${row.constraint_name}";`,
          { transaction: t }
        ).catch(() => {/* ignore if already dropped */});
      }

      // Recreate FK with ON DELETE SET NULL and ON UPDATE CASCADE
      await sequelize.query(
        `ALTER TABLE "MohafezUsers"
           ADD CONSTRAINT "MohafezUsers_organizationId_fkey"
           FOREIGN KEY ("organizationId")
           REFERENCES "Organizations" ("organizationId")
           ON DELETE SET NULL
           ON UPDATE CASCADE;`,
        { transaction: t }
      ).catch(() => {/* ignore if already exists with correct options */});
    });
    
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

