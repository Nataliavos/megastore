import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

import productsRouter   from './routes/products.js';
import migrateRouter    from './routes/migrate.js';
import suppliersRouter  from './routes/suppliers.js';
import customersRouter  from './routes/customers.js';
import categoriesRouter from './routes/categories.js';

const app = express();
app.use(express.json());

// ── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/products',   productsRouter);   // CRUD completo de productos
app.use('/api/migrate',    migrateRouter);    // carga masiva del CSV
app.use('/api/suppliers',  suppliersRouter);  // BI: análisis de proveedores
app.use('/api/customers',  customersRouter);  // BI: historial de cliente
app.use('/api/categories', categoriesRouter); // BI: productos por categoría

app.use(errorHandler);

export default app;