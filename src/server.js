import app from './app.js';
import { env } from './config/env.js';
import { testConnection, initSchema } from './config/postgres.js';
import { connectMongo } from './config/mongo.js';


// ── Arranque ────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await testConnection();   // 1. verifica conexión
    await initSchema();       // 2. crea tablas si no existen
    await connectMongo();     // 3. conecta MongoDB
    app.listen(env.port, () =>
      console.log(`🚀 Servidor corriendo en http://localhost:${env.port}`)
    );
  } catch (err) {
    console.error('🔴 Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
};

start();
