import { query } from '../config/postgres.js';

/**
 * GET /api/categories/:name/top-products
 * Productos más vendidos dentro de una categoría específica,
 * ordenados por ingresos generados (total_revenue DESC).
 *
 * SQL: categories → products → transactions (JOINs + GROUP BY + ORDER BY)
 */
export const getTopProducts = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        p.product_sku,
        p.product_name,
        SUM(t.quantity)         AS total_units_sold,
        SUM(t.total_line_value) AS total_revenue
      FROM   categories c
      JOIN   products p     USING (category_id)
      JOIN   transactions t USING (product_sku)
      WHERE  LOWER(c.category_name) = LOWER($1)
      GROUP  BY p.product_sku, p.product_name
      ORDER  BY total_revenue DESC
    `, [req.params.name]);

    if (!rows.length)
      return res.status(404).json({ message: 'Categoría no encontrada o sin ventas' });

    res.json(rows);
  } catch (err) { next(err); }
};
