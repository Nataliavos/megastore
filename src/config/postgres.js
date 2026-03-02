import { Pool } from 'pg';
import { env } from 'env.js';

// Pool de conexiones: reutiliza conexiones en lugar de crear una nueva cada vez
const pool = new Pool({
  connectionString: env.postgresUri
});

// Evento: log cuando el pool crea una nueva conexión
pool.on('connect', () => {
  console.log('✅ New connection established with PostgreSQL');
});

// Evento: log si ocurre un error inesperado en el pool
pool.on('error', (err) => {
  console.error('❌ Unexpected error in the PostgreSQL pool:', err.message);
  process.exit(1);
});

/**
 * Prueba la conexión a la base de datos.
 * Se llama al iniciar el servidor.
 */
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() AS current_time');
    console.log('🟢 PostgreSQL connected:', result.rows[0].current_time);
  } catch (error) {
    console.error('🔴 Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release(); // siempre libera el cliente al pool
  }
};

/**
 * Ejecuta una query con parámetros de forma segura (previene SQL injection).
 * @param {string} text  - Query SQL con placeholders $1, $2...
 * @param {Array}  params - Valores para los placeholders
 */
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📋 Query executed in ${duration}ms →`, text.substring(0, 60));
    return result;
  } catch (error) {
    console.error('❌ Error in query:', error.message);
    console.error('   SQL:', text);
    console.error('   Params:', params);
    throw error;
  }
};

export { pool, query, testConnection };