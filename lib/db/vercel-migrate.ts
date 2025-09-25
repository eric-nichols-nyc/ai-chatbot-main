import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runVercelMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    console.log('⚠️ POSTGRES_URL not found, skipping database setup');
    process.exit(0);
  }

  try {
    const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
    const db = drizzle(connection);

    console.log('⏳ Checking database connection...');

    // Simple connection test
    await db.execute('SELECT 1');

    console.log('✅ Database connection successful');
    console.log(
      'ℹ️ Using db:push for schema sync (migrations handled separately)',
    );

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.log(
      '⚠️ Database setup skipped due to error:',
      err instanceof Error ? err.message : 'Unknown error',
    );
    process.exit(0); // Don't fail the build
  }
};

runVercelMigrate();
