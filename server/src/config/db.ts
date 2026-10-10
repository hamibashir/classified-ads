import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

let isDbConnected = false;

/**
 * Connect to database and verify connectivity
 */
export const connectDB = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    isDbConnected = true;
    console.log('[Database] Connected to MySQL database successfully.');
    return true;
  } catch (error) {
    isDbConnected = false;
    const message = error instanceof Error ? error.message : 'Unknown database connection error';
    console.warn(`[Database] Connection warning: Unable to connect to MySQL database.`);
    console.warn(`[Database] Details: ${message}`);
    console.warn(`[Database] Note: Ensure MySQL is running and DATABASE_URL in .env is correctly configured.`);
    return false;
  }
};

/**
 * Disconnect from database gracefully
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    isDbConnected = false;
    console.log('[Database] Disconnected from MySQL database cleanly.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown disconnect error';
    console.error(`[Database] Disconnect error: ${message}`);
  }
};

/**
 * Check current database connectivity status
 */
export const getDbStatus = (): { isConnected: boolean } => {
  return {
    isConnected: isDbConnected,
  };
};

export default prisma;
