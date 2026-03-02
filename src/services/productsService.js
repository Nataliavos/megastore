import { query } from '../config/postgres.js';
import { AuditLog } from '../config/mongo.js';

// GET /api/products
export const getAll = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT p.product_sku,
             p.product_name,
             p.unit_price,
             c.category
      FROM   products p
      JOIN   categories c USING (category_id)
      ORDER  BY p.product_name
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/products/:sku
export const getOne = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT p.product_sku,
             p.product_name,
             p.unit_price,
             c.category
      FROM   products p
      JOIN   categories c USING (category_id)
      WHERE  p.product_sku = $1
    `, [req.params.sku]);
    if (!rows.length)
      return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/products
// Body: { product_sku, product_name, unit_price, category_id }
export const create = async (req, res, next) => {
  try {
    const { product_sku, product_name, unit_price, category_id } = req.body;
    const { rows } = await query(`
      INSERT INTO products (product_sku, product_name, unit_price, category_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [product_sku, product_name, unit_price, category_id]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/products/:sku
// Body: { product_name, unit_price, category_id }
export const update = async (req, res, next) => {
  try {
    const { product_name, unit_price, category_id } = req.body;
    const { rows } = await query(`
      UPDATE products
      SET    product_name = $1,
             unit_price   = $2,
             category_id  = $3
      WHERE  product_sku  = $4
      RETURNING *
    `, [product_name, unit_price, category_id, req.params.sku]);
    if (!rows.length)
      return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/products/:sku → guarda log de auditoría en MongoDB
export const remove = async (req, res, next) => {
  try {
    const { rows } = await query(`
      DELETE FROM products WHERE product_sku = $1 RETURNING *
    `, [req.params.sku]);
    if (!rows.length)
      return res.status(404).json({ message: 'Producto no encontrado' });

    // Guardar log de auditoría: el snapshot se embebe porque el producto
    // ya no existe en SQL; no hay referencia posible → embedding correcto.
    await AuditLog.create({
      entity:   'product',
      action:   'DELETE',
      entityId: rows[0].product_sku,
      snapshot: rows[0],
    });

    res.json({ message: 'Product deleted', deleted: rows[0] });
  } catch (err) { next(err); }
};
