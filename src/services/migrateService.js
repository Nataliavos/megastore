import { createReadStream } from 'fs';
import { parse } from 'csv-parse/sync';
import { env } from '../config/env.js';
import { pool }  from '../config/postgres.js';

/**
 * POST /api/migrate
 * Lee el CSV y distribuye los datos en las 5 tablas de PostgreSQL.
 *
 * Idempotencia:
 *  - Tablas maestras (categories, suppliers, customers, products):
 *    INSERT ... ON CONFLICT DO NOTHING → nunca duplica entidades.
 *  - transactions: se verifica por (transaction_id, product_sku) antes de insertar.
 *
 * Todo el proceso corre dentro de una única transacción SQL para
 * garantizar consistencia; si algo falla se hace ROLLBACK completo.
 */

export const runMigration = async (req, res, next) => {
  const client = await pool.connect();
  let inserted = 0;
  let skipped  = 0;

  try {

    await client.query('BEGIN');

    const records = await parseCsv(env.fileCsv);

    for (const row of records) {

      // ─────────────────────────────────────────────────────────────
      // CATEGORIES
      // ─────────────────────────────────────────────────────────────
      await client.query(
        `INSERT INTO categories (category)
        VALUES ($1)
        ON CONFLICT (category) DO UPDATE SET category = EXCLUDED.category
        RETURNING id`,
        [row.product_category]
      );
      const { rows: catRows } = await client.query(
        `SELECT category_id FROM categories WHERE category_name = $1`,
        [row.product_category]
      );
      const categoryId = catRows[0].category_id;

      // ─────────────────────────────────────────────────────────────
      // SUPPLIERS
      // ─────────────────────────────────────────────────────────────
      await client.query(
        `INSERT INTO suppliers (supplier_name, supplier_email)
        VALUES ($1, $2)
        ON CONFLICT (supplier_email) DO UPDATE
          SET supplier_name    = EXCLUDED.supplier_name
        RETURNING id`,
        [row.supplier_name, row.supplier_email]
      );
      const { rows: supRows } = await client.query(
        `SELECT supplier_id FROM suppliers WHERE supplier_email = $1`,
        [row.supplier_email]
      );
      const supplierId = supRows[0].supplier_id;

      // ─────────────────────────────────────────────────────────────
      // CUSTOMERS
      // ─────────────────────────────────────────────────────────────
      await client.query(
        `INSERT INTO customers (customer_name, customer_email, customer_address, customer_phone)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (customer_email) DO UPDATE
          SET customer_name    = EXCLUDED.customer_name,
              customer_address   = EXCLUDED.customer_address,
              customer_phone = EXCLUDED.customer_phone
        RETURNING id`,
        [row.customer_name, row.customer_email, row.customer_address, row.customer_phone]
      );
      const { rows: custRows } = await client.query(
        `SELECT customer_id FROM customers WHERE customer_email = $1`,
        [row.customer_email]
      );
      const customerId = custRows[0].customer_id;

      // ─────────────────────────────────────────────────────────────
      // PRODUCTS
      // ─────────────────────────────────────────────────────────────
      await client.query(
        `INSERT INTO products (
          product_sku,
          product_name,
          unit_price,
          category_id
      ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (product_sku) DO UPDATE
          SET product_name = EXCLUDED.product_name,
            unit_price   = EXCLUDED.unit_price,
            category_id  = EXCLUDED.category_id
        RETURNING id`,
        [row.product_sku, row.product_name, row.unit_price, categoryMap.get(row.product_category)]
      );

      // ─────────────────────────────────────────────────────────────
      // TRANSACTIONS
      // ─────────────────────────────────────────────────────────────

      const { rows: check } = await client.query(
        `SELECT item_id FROM transactions
         WHERE transaction_id = $1 AND product_sku = $2`,
        [row.transaction_id, row.product_sku]
      );

      if (check.length === 0) {
        await client.query(
        `INSERT INTO transactions
          (transaction_id, date, customer_id, product_sku, supplier_id, quantity, total_line_value)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (transaction_id) DO NOTHING`,
          [row.transaction_id, 
          row.date, 
          customerId, 
          row.product_sku, 
          supplierId, 
          parseInt(row.quantity), 
          parseFloat(row.total_line_value)
        ]
      );
      inserted++;
    } else {
      skipped++;
    }

  


  }
}




      
      

      

      

      
    }

    await client.query('COMMIT');
    res.json({
      message:  'Migration completed successfully',
      total:    records.length,
      inserted,
      skipped,
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);    
  } finally {
    client.release();
  }

};
// ─────────────────────────────────────────────────────────────
// CONFIG DEBUG
// ─────────────────────────────────────────────────────────────
const DEBUG = process.env.DEBUG_MIGRATION === 'true';

const log = {
  info:  (msg) => console.log(msg),
  debug: (msg) => DEBUG && console.log(`   🔍 [DEBUG] ${msg}`),
  warn:  (msg) => console.warn(`   ⚠️  ${msg}`),
  error: (msg) => console.error(`   ❌ ${msg}`),
};

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────
const parseCsv = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];
    createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
      .on('data',  (row) => rows.push(row))
      .on('end',   ()    => resolve(rows))
      .on('error', (err) => reject(err));
  });




// ------------------------


// ─────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────────────────────

export const runMigration2 = async () => {
  log.info('🚀 Starting migration CSV → PostgreSQL...');
  log.info(`🔧 DEBUG mood: ${DEBUG ? 'ACTIVATED' : 'deactivated'}`);
  log.info('═'.repeat(50));

  const client = await pool.connect();

  let inserted = 0;
  let skipped  = 0;

  try {

    await client.query('BEGIN');

    const records = await parseCsv(env.fileCsv);

    for (const row of records) {
      


    }

    // Nuevo: valida ANTES de insertar
    validateCSV(rows);

    const categoryMap = await migrateCategories(client, rows);
    const customerMap   = await migrateCustomers(client, rows);
    const supplierMap    = await migrateSuppliers(client, rows);
    const productMap = await migrateProducts(client, rows, categoryMap);

    await migrateTransactions(client, rows, { customerMap, supplierMap, productMap });

    await client.query('COMMIT');

    log.info('\n' + '═'.repeat(50));
    log.info('✅ Migration completed successfully');
    log.info('═'.repeat(50));

    return {
      customers:     customerMap.size,
      suppliers:     supplierMap.size,
      products:      productMap.size,
      transactions:  rows.length,
      csvPath:      CSV_PATH,
    };

  } catch (error) {
    await client.query('ROLLBACK');
    log.error('Migration failed — ROLLBACK executed');
    log.error(`Error: ${error.message}`);
    if (DEBUG) console.error(error.stack);
    throw error;
  } finally {
    client.release();
  }
};

export { runMigration };
