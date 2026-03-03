import { query } from '../config/postgres.js';

/**
 * GET /api/customers/:email/history
 * Historial completo de compras de un cliente, detallando productos,
 * fechas y el total gastado en cada transacción.
 *
 * SQL: clientes → transactions → products (JOINs)
 * Los resultados se agrupan en memoria por transaction_id.
 */
export const getHistory = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        t.transaction_id,
        t.date,
        p.product_sku,
        p.product_name,
        t.quantity,
        p.unit_price,
        t.total_line_value
      FROM   customers c
      JOIN   transactions t USING (customer_id)
      JOIN   products p     USING (product_sku)
      WHERE  c.customer_email = $1
      ORDER  BY t.date DESC, t.transaction_id
    `, [req.params.email]);

    if (!rows.length)
      return res.status(404).json({ message: 'Customer not found or without purchases' });

    // Agrupar los renglones por transaction_id y acumular el total
    const grouped = rows.reduce((acc, row) => {
      const txn = acc[row.transaction_id] ??= {
        transaction_id:    row.transaction_id,
        date:  row.date,
        items:             [],
        transaction_total: 0,
      };
      txn.items.push({
        product_sku:      row.product_sku,
        product_name:     row.product_name,
        quantity:         row.quantity,
        unit_price:       row.unit_price,
        total_line_value: row.total_line_value,
      });
      txn.transaction_total += Number(row.total_line_value);
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) { next(err); }
};