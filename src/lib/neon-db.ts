// Neon Database Connection Configuration
import { Pool } from '@neondatabase/serverless'
import { neon } from '@neondatabase/serverless'

interface NeonConfig {
  connectionString: string
  maxConnections: number
  idleTimeoutMillis: number
  connectionTimeoutMillis: number
  ssl: boolean
}

export const NEON_CONFIG: NeonConfig = {
  connectionString: process.env.DATABASE_URL as string,
  maxConnections: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: true
}

// Create connection pool for Neon
export const createNeonPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  return new Pool({
    connectionString: NEON_CONFIG.connectionString,
    max: NEON_CONFIG.maxConnections,
    idleTimeoutMillis: NEON_CONFIG.idleTimeoutMillis,
    connectionTimeoutMillis: NEON_CONFIG.connectionTimeoutMillis,
    ssl: NEON_CONFIG.ssl
  })
}

// Health check for database connection
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const pool = createNeonPool()
    const client = await pool.connect()
    
    const result = await client.query('SELECT NOW() as current_time, version() as version')
    client.release()
    
    console.log('✅ Database connection successful:', {
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0]
    })
    
    await pool.end()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Database connection info
export const getDatabaseInfo = () => {
  const url = new URL(process.env.DATABASE_URL || '')
  return {
    host: url.hostname,
    port: url.port || '5432',
    database: url.pathname.slice(1),
    user: url.username,
    ssl: url.searchParams.get('sslmode') === 'require',
    pooling: url.searchParams.get('pgbouncer') === 'true'
  }
}

// Execute raw SQL query with connection pooling
export const executeQuery = async (sql: string, params: any[] = []) => {
  const pool = createNeonPool()
  
  try {
    const client = await pool.connect()
    const result = await client.query(sql, params)
    client.release()
    return result
  } catch (error) {
    console.error('Query execution error:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Direct SQL execution using Neon serverless driver
export const executeNeonQuery = async (sql: string, params: any[] = []) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  const neonSql = neon(process.env.DATABASE_URL)
  
  try {
    // Convert string SQL to template literal format for Neon
    const result = await neonSql`${sql}`
    return result
  } catch (error) {
    console.error('Neon query execution error:', error)
    throw error
  }
}

// Migration helper for Neon
export const runMigration = async (migrationSql: string) => {
  try {
    console.log('🔄 Running migration on Neon database...')
    const result = await executeQuery(migrationSql)
    console.log('✅ Migration completed successfully')
    return result
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

export default {
  config: NEON_CONFIG,
  createPool: createNeonPool,
  checkHealth: checkDatabaseHealth,
  getInfo: getDatabaseInfo,
  executeQuery,
  runMigration
}