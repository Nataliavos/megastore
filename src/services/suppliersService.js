import { query } from '../config/postgres.js';

/**
 * GET /api/suppliers/analysis
 * Proveedores ordenados por total de items vendidos (cantidad),
 * con el valor total del inventario asociado a cada uno.
 *
 * SQL: JOIN transactions → GROUP BY supplier → SUM quantity + SUM total_line_value
 */
export const getAnalysis = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        s.supplier_name,
        s.supplier_email,
        SUM(t.quantity)          AS total_items_sold,
        SUM(t.total_line_value)  AS total_inventory_value
      FROM   suppliers s
      JOIN   transactions t USING (supplier_id)
      GROUP  BY s.supplier_id, s.supplier_name, s.supplier_email
      ORDER  BY total_items_sold DESC
    `);
    res.json(rows);
  } catch (err) { next(err); }
};
